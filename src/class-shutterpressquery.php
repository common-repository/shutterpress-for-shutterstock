<?php


use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\TransferStats;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
if ( ! class_exists( 'ShutterpressQuery' ) ) {
	class ShutterpressQuery {
		/**
		 * @var Singleton The reference the *Singleton* instance of this class
		 */
		private static $instance;

		/**
		 * Api url
		 */
		const URL = 'https://shutterpress-api.herokuapp.com';
		/**
		 * Api version
		 */
		const VERSION = 'v1';

		/**
		 * @var string
		 */
		private $api_key;

		/**
		 * @var Client
		 */
		private $client;

		public static function get_instance() {
			if ( null === self::$instance ) {
				self::$instance = new self();
			}

			return self::$instance;
		}

		/**
		 * Shutterpress constructor.
		 */
		protected function __construct() {
			$this->api_key =
				add_action( 'plugins_loaded', array( $this, 'init' ) );
		}

		/**
		 *
		 */
		public function init() {
			$this->actions();
		}


		/**
		 *
		 */
		public function actions() {
			add_action( 'wp_ajax_query-shutterpress', array( $this, 'query' ) ); // executed when logged in
			add_action( 'wp_ajax_download-shutterpress', array( $this, 'download' ) ); // executed when logged in
			add_action( 'wp_ajax_cache-shutterpress', array( $this, 'cache' ) ); // executed when logged in
			add_action( 'wp_ajax_validate-shutterpress', array( $this, 'validate' ) ); // executed when logged in
		}

		/**
		 *
		 */
		public function validate() {
			wp_send_json_success( $this->call( 'GET', 'validate', array( 'key' => sanitize_key( $_REQUEST['key'] ) ) ) );
		}

		/**
		 *
		 */
		public function query() {
			if ( ! current_user_can( 'upload_files' ) ) {
				wp_send_json_error();
			}

			$query = $_REQUEST['query'];

			$images = $this->images( $query );
			if ( is_wp_error( $images ) ) {
				/** @var WP_Error $images */
				wp_send_json_error( $images );
				die();
			}

			wp_send_json_success( $this->format( $images->data ) );
		}

		/**
		 *
		 */
		public function cache() {
			if ( ! current_user_can( 'upload_files' ) ) {
				wp_send_json_error();
			}

			$id      = $_REQUEST['media_id'];
			$post_id = $_REQUEST['post_id'];
			$args    = array(
				'post_type'   => 'attachment',
				'post_status' => 'inherit',
				'meta_query'  => array(
					array(
						'key'   => 'shutterpress_id',
						'value' => $id
					)
				)
			);
			$query   = new WP_Query( $args );
			if ( ! $query->have_posts() ) {
				wp_send_json_error( array( 'message' => __( 'Image not found in cache', 'shutterpress' ) ) );
			}

			wp_send_json_success( wp_prepare_attachment_for_js( $query->post->ID ) );

		}

		/**
		 *
		 */
		public function download() {
			if ( ! current_user_can( 'upload_files' ) ) {
				wp_send_json_error( array( 'message' => __( 'You are not allowed to upload files', 'shutterpress' ) ) );
			}


			$id          = $_REQUEST['media_id'];
			$post_id     = $_REQUEST['post_id'];
			$search      = isset( $_REQUEST['search'] ) ? sanitize_title( $_REQUEST['search'] ) : $this->get_domain();
			$description = sanitize_textarea_field( $_REQUEST['description'] );
			$image       = $this->image( $id, $post_id, $description, $search );

			if ( is_wp_error( $image ) ) {
				wp_send_json_error( array( 'message' => $image->get_error_message() ) );
			}

			wp_send_json_success( wp_prepare_attachment_for_js( $image ) );

		}


		/**
		 * @param $data
		 *
		 * @return array
		 */
		private function format( $data ) {
			$response = array();
			foreach ( $data as $image ) {
				$response[] = $this->individual( $image );
			}

			return $response;
		}

		/**
		 * @param $image
		 *
		 * @return array
		 */
		private function individual( $image ) {
			return [
				'id'          => $image->id,
				'description' => $image->description,
				'url'         => $image->assets->huge_thumb->url,
				'sizes'       => [
					'full'      => $this->size( $image, 'huge_thumb' ),
					'medium'    => $this->size( $image, 'preview' ),
					'thumbnail' => $this->size( $image, 'large_thumb' )
				]
			];
		}

		private function size( $image, $format ) {
			return [
				'height'      => $image->assets->$format->height,
				'width'       => $image->assets->$format->width,
				'orientation' => ( $image->aspect > 1 ? 'landscape' : 'portrait' ),
				'url'         => $image->assets->$format->url
			];
		}

		private function image( $media_id, $post_id, $description = '', $search = '' ) {

			$image = $this->call( 'GET', 'image', array( 'media_ids' => $media_id ) );
			if ( ! isset( $image->data[0]->download->url ) ) {
				return new WP_Error( 'download_failure', __( 'There has been a problem with the download. Please check your shutterstock account and make sure you are still allowed to licence images', 'shutterpress' ) );
			}
			$attachment_id = $this->upload_remote_image_and_attach( $image->data[0]->download->url, $post_id, $description, $search );
			if ( is_wp_error( $attachment_id ) ) {
				return $attachment_id;
			}
			if ( ! $attachment_id ) {
				return new WP_Error( __( 'upload_failure', 'There has been a problem with the upload. Please try again', 'shutterpress' ) );
			}

			update_post_meta( $attachment_id, 'shutterpress_id', $media_id );

			return $attachment_id;
		}

		private function images( $query = [] ) {

			return $this->call( 'GET', 'images/search', $query );
		}

		/**
		 * @param       $method
		 * @param       $path
		 * @param array $query
		 *
		 * @return mixed|null
		 */
		private function call( $method, $path, $query = [] ) {
			/** @var Shutterpress $shutterpress */
			global $shutterpress;

			$api_key = $shutterpress->admin->get_api_key();
			if ( ! $api_key && $path != 'validate' ) {
				return new WP_Error( 2, __( 'You need to a valid license key to use the plugin.', 'shutterpress' ) );
			}

			try {
				if ( ! isset( $query['key'] ) ) {
					$query = array_merge( $query,
						[
							'key' => $shutterpress->admin->get_api_key(),
						]
					);
				}
				$query = array_merge( $query,
					[
						'referral' => get_bloginfo( 'url' ),
					]
				);

				$response = $this->client()->request( $method, $path,
					[
						'query'    => $query,
						'on_stats' => function ( TransferStats $stats ) use ( &$url ) {
							$url = $stats->getEffectiveUri();
						}
					]
				);

				return json_decode( $response->getBody() );
			} catch ( GuzzleException $exception ) {
				return new WP_Error( 1, __( 'Can\'t connect to ShutterPress server.', 'shutterpress' ) );
			}
		}

		/**
		 * @return Client
		 */
		private function client() {

			if ( ! $this->client ) {
				$this->client = new Client(
					[
						'base_uri' => self::URL . '/' . self::VERSION . '/',
					]
				);
			}

			return $this->client;
		}

		/**
		 * @param        $image_url
		 * @param        $parent_id
		 *
		 * @param        $description
		 *
		 * @param string $search
		 *
		 * @return bool|int|WP_Error
		 */
		private function upload_remote_image_and_attach( $image_url, $parent_id, $description, $search = '' ) {

			$image = $image_url;
			$get   = wp_remote_get( $image, array( 'timeout' => 30 ) );
			if ( is_wp_error( $get ) ) {
				return new WP_Error( 100, __( 'Image download failed, please try again. Errors:', 'shutterpress' ) . PHP_EOL . $get->get_error_message() );
			}
			$type = wp_remote_retrieve_header( $get, 'content-type' );
			if ( ! $type ) {
				return new WP_Error( 100, __( 'Image type couldn\'t be determined', 'shutterpress' ) );
			}
			$name       = str_replace( 'shutterstock', $search, basename( $image ) );
			$mirror     = wp_upload_bits( $name, '', wp_remote_retrieve_body( $get ) );
			$attachment = array(
				'post_title'     => $name,
				'post_content'   => $description,
				'post_mime_type' => $type
			);
			$attach_id  = wp_insert_attachment( $attachment, $mirror['file'], $parent_id );
			require_once( ABSPATH . 'wp-admin/includes/image.php' );
			$attach_data = wp_generate_attachment_metadata( $attach_id, $mirror['file'] );
			wp_update_attachment_metadata( $attach_id, $attach_data );

			return $attach_id;

		}

		/**
		 * @return mixed
		 */
		private function get_domain() {
			$url   = get_bloginfo( 'url' );
			$parse = parse_url( $url );

			return strtok( $parse['host'], '.' );
		}


	}

	$GLOBALS['shutterpress_query'] = ShutterpressQuery::get_instance();
}