<?php

/**
 * Class ShutterpressAdmin
 *
 * Handle the settings admin page
 */
class ShutterpressAdmin {
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
		$this->actions();
	}


	/**
	 *
	 */
	public function actions() {
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'admin_menu', array( $this, 'register_settings_page' ) );
	}

	/**
	 *  Register settings
	 */
	public function register_settings() {

		$this->settings_api = new WeDevs_Settings_API();
		//set sections and fields
		$this->settings_api->set_sections( $this->get_settings_sections() );
		$this->settings_api->set_fields( $this->get_settings_fields() );

		//initialize them
		$this->settings_api->admin_init();
	}

	/**
	 *
	 */
	public function register_settings_page() {
		add_options_page( __( 'ShutterPress', 'shutterpress' ), __( 'ShutterPress', 'shutterpress' ), 'delete_posts', 'shutterpress',
			array( $this, 'plugin_page' )
		);
	}


	/**
	 *
	 */
	public function plugin_page() {

		echo '<div class="wrap">';
		echo '<div class="notice notice-error">The plugin is temporarily paused as shutterstock have introduced a paying model for their api. Due to this issue its no longer free to make a call to preview or download images from their website. All current users can ask for a refund, registrations have now been closed until further notice. We are working a new version that would allow users to use the plugin again. You can read more about the api changes here https://www.shutterstock.com/api/pricing</div>';
		$this->settings_api->show_navigation();
		$this->settings_api->show_forms();
		echo '<a class="license-key-link" href="https://www.shutterpress.co/" target="_blank">' . __( 'Get your license key', 'shutterpress' ) . '</a>';

		echo '</div>';
	}

	/**
	 * @return mixed
	 */
	public function get_api_key() {
		return $this->get_option( 'auth_token', 'shutterpress_basics' );
	}

	/**
	 * @return array
	 */
	private function get_settings_sections() {
		return array(
			array(
				'id'    => 'shutterpress_basics',
				'title' => __( 'ShutterPress', 'shutterpress' ),
			),
		);
	}

	/**
	 * @return array
	 */
	private function get_settings_fields() {
		return array(
			'shutterpress_basics' => array(
				array(
					'name'    => 'auth_token',
					'label'   => __( 'License key', 'shutterpress' ),
					'desc'    => __( 'This is the license key that is used for authentication', 'shutterpress' ),
					'type'    => 'text',
					'default' => '',
					'size'    => 'validate-shutterpress-key regular' //small hack to add class
				),
			),
		);
	}

	/**
	 * Get the value of a settings field
	 *
	 * @param string $option settings field name
	 * @param string $section the section name this field belongs to
	 * @param string $default default text if it's not found
	 *
	 * @return mixed
	 */
	private function get_option( $option, $section, $default = '' ) {

		$options = get_option( $section );

		if ( isset( $options[ $option ] ) ) {
			return $options[ $option ];
		}

		return $default;
	}
}