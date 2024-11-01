<?php
/*
 * Plugin Name: ShutterPress – Shutterstock Wordpress Plugin
 * Plugin URI: https://wordpress.org/plugins/shutterpress/
 * Description: Easily insert images from Shutterstock into your posts
 * Author: Derikon Development
 * Author URI: https://derikon.com/
 * Version: 1.2
 * Text Domain: shutterpress
 * Domain Path: /languages
 *
 * Copyright (c) 2016 Derikon Development
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.xdebu
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
*/


require( __DIR__ . '/vendor/autoload.php' );

if ( ! class_exists( 'Shutterpress' ) ) {
	class Shutterpress {

		/**
		 * @var Singleton The reference the *Singleton* instance of this class
		 */
		private static $instance;

		/** @var ShutterpressAdmin */
		public $admin;

		/** @var ShutterpressMedia */
		public $media;

		/** @var ShutterpressQuery */
		public $query;

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
			$this->dependencies();
			add_action( 'plugins_loaded', array( $this, 'init' ) );
		}

		/**
		 *
		 */
		public function filters() {
			add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), array(
				$this,
				'plugin_action_links'
			) );
		}

		/**
		 * Init the plugin after plugins_loaded so environment variables are set.
		 */
		public function init() {
			// works
			load_plugin_textdomain( 'shutterpress', false, plugin_basename( dirname( __FILE__ ) ) . '/languages' );
			$this->filters();
		}

		/**
		 *
		 */
		public function dependencies() {
			$this->admin = \ShutterpressAdmin::get_instance();
			$this->media = \ShutterpressMedia::get_instance();
			$this->query = \ShutterpressQuery::get_instance();
		}

		/**
		 * Adds plugin action links
		 *
		 * @since 1.0.0
		 */
		public function plugin_action_links( $links ) {
			$setting_link = $this->get_setting_link();
			$plugin_links = array(
				'<a href="' . $setting_link . '">' . __( 'Settings', 'shutterpress' ) . '</a>',
			);

			return array_merge( $plugin_links, $links );
		}

		/**
		 * Get setting link.
		 *
		 * @since 1.0.0
		 *
		 * @return string Setting link
		 */
		public function get_setting_link() {

			return admin_url( 'options-general.php?page=shutterpress' );
		}

	}

	$GLOBALS['shutterpress'] = Shutterpress::get_instance();
}