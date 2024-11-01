<?php


if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
if ( ! class_exists( 'ShutterpressMedia' ) ) {
	class ShutterpressMedia {
		/**
		 * @var Singleton The reference the *Singleton* instance of this class
		 */
		private static $instance;

		/**
		 * @var WeDevs_Settings_API
		 */
		public $settings_api;

		/**
		 * Returns the *Singleton* instance of this class.
		 *
		 * @return Singleton The *Singleton* instance.
		 */
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
			add_action( 'plugins_loaded', array( $this, 'init' ) );
		}

		/**
		 *
		 */
		public function init() {
			$this->filters();
			$this->actions();
		}


		/**
		 *
		 */
		public function enqueue() {
			$screen = get_current_screen();
			wp_enqueue_script( 'shutterpress', plugins_url( '../dist/js/shutterpress.js', __FILE__ ), array(
				'media-views',
				'wp-color-picker'
			), false, true );
			if ( $screen->id === 'settings_page_shutterpress' ) {
				wp_enqueue_script( 'shutterpress-admin', plugins_url( '../dist/js/shutterpress-settings.js', __FILE__ ), array( 'jquery' ), false, true );
				wp_enqueue_style( 'settings-shutterpress', plugins_url( '../dist/css/shutterpress-settings.css', __FILE__ ), array(), false );
			}
			wp_enqueue_style( 'wp-color-picker' );
			wp_enqueue_style( 'shutterpress-', plugins_url( '../dist/css/shutterpress.css', __FILE__ ), false );

		}


		/**
		 *
		 */
		public function filters() {
			add_filter( 'media_view_strings', array( $this, 'tab_text' ), 10, 2 );
		}

		public function actions() {
			add_action( 'admin_enqueue_scripts', array( $this, 'templates' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'enqueue' ) );
		}


		/**
		 *
		 */
		public function templates() {
			include_once( __DIR__ . '/../templates/attachment.php' );
			include_once( __DIR__ . '/../templates/empty.php' );
			include_once( __DIR__ . '/../templates/details.php' );
			include_once( __DIR__ . '/../templates/downloader.php' );
		}

		/**
		 * @param $strings
		 * @param $post
		 *
		 * @return array
		 */
		public function tab_text( $strings, $post ) {
			$strings['shutterpress'] = array(
				'title'    => __( 'ShutterPress', 'shutterpress' ),
				'button'   => __( 'Insert into post', 'shutterpress' ),
				'retry'    => __( 'Retry', 'shutterpress' ),
				'noMedia'  => __( 'No images have been found', 'shutterpress' ),
				'error'    => __( 'There has been an issue with the your license key', 'shutterpress' ),
				'link'     => __( 'Set license key', 'shutterpress' ),
				'search'   => __( 'Search shutterstock images', 'shutterpress' ),
				'close'    => __( 'Close', 'shutterpress' ),
				'download' => __( 'Download', 'shutterpress' ),
				'license'  => __( 'Your license key is not valid', 'shutterpress' ),
				'advanced' => __( 'Advanced search', 'shutterpress' ),
				'filters'  => [
					'gender'      => [
						'label'  => __( 'Gender', 'shutterpress' ),
						'female' => __( 'Female', 'shutterpress' ),
						'male'   => __( 'Male', 'shutterpress' ),
					],
					'orientation' => [
						'label'      => __( 'Orientation', 'shutterpress' ),
						'horizontal' => __( 'Horizontal', 'shutterpress' ),
						'vertical'   => __( 'Vertical', 'shutterpress' ),
					],
					'image_type'  => [
						'label'        => __( 'Image type', 'shutterpress' ),
						'photo'        => __( 'Photos', 'shutterpress' ),
						'vector'       => __( 'Vectors', 'shutterpress' ),
						'illustration' => __( 'Illustrations', 'shutterpress' ),
					],
					'categories'  => [
						'label'   => __( 'Category', 'shutterpress' ),
						'default' => __( 'Any Category', 'shutterpress' ),
						'values'  => [
							'Abstract'               => __( 'Abstract', 'shutterpress' ),
							'Animals/Wildlife'       => __( 'Animals/Wildlife', 'shutterpress' ),
							'The Arts'               => __( 'The Arts', 'shutterpress' ),
							'Backgrounds/Textures'   => __( 'Backgrounds/Textures', 'shutterpress' ),
							'Beauty/Fashion'         => __( 'Beauty/Fashion', 'shutterpress' ),
							'Buildings/Landmarks'    => __( 'Buildings/Landmarks', 'shutterpress' ),
							'Business/Finance'       => __( 'Business/Finance', 'shutterpress' ),
							'Celebrities'            => __( 'Celebrities', 'shutterpress' ),
							'Editorial'              => __( 'Editorial', 'shutterpress' ),
							'Education'              => __( 'Education', 'shutterpress' ),
							'Food and Drink'         => __( 'Food and Drink', 'shutterpress' ),
							'Healthcare/Medical'     => __( 'Healthcare/Medical', 'shutterpress' ),
							'Holidays'               => __( 'Holidays', 'shutterpress' ),
							'Illustrations/Clip-Art' => __( 'Illustrations/Clip-Art', 'shutterpress' ),
							'Industrial'             => __( 'Industrial', 'shutterpress' ),
							'Interiors'              => __( 'Interiors', 'shutterpress' ),
							'Miscellaneous'          => __( 'Miscellaneous', 'shutterpress' ),
							'Nature'                 => __( 'Nature', 'shutterpress' ),
							'Objects'                => __( 'Objects', 'shutterpress' ),
							'Parks/Outdoor'          => __( 'Parks/Outdoor', 'shutterpress' ),
							'People'                 => __( 'People', 'shutterpress' ),
							'Religion'               => __( 'Religion', 'shutterpress' ),
							'Science'                => __( 'Science', 'shutterpress' ),
							'Signs/Symbols'          => __( 'Signs/Symbols', 'shutterpress' ),
							'Sports/Recreation'      => __( 'Sports/Recreation', 'shutterpress' ),
							'Technology'             => __( 'Technology', 'shutterpress' ),
							'Transportation'         => __( 'Transportation', 'shutterpress' ),
							'Vectors'                => __( 'Vectors', 'shutterpress' ),
							'Vintage'                => __( 'Vintage', 'shutterpress' ),

						]
					],
					'safe'        => [
						'label' => __( 'Safe', 'shutterpress' ),
						'yes'   => __( 'Yes', 'shutterpress' ),
						'no'    => __( 'No', 'shutterpress' ),
					],
					'color'       => [
						'text' => __( 'Color', 'shutterpress' ),
					],

				],
				'url'      => admin_url( 'options-general.php?page=shutterpress' ),
			);

			return $strings;
		}


	}

	$GLOBALS['shutterpress_media'] = ShutterpressMedia::get_instance();
}