<script type="text/html" id="tmpl-shutterpress-empty">
	<# var messageClass = data.message ? 'has-message' : 'no-message'; #>
	<# var errorClass = data.error ? 'has-error' : 'no-error'; #>
	<div class="no-data {{ messageClass }} {{errorClass}}">
		<# if ( data.message ) { #>
		<h2 class="shutterpress-message">{{ data.message }}</h2>
		<# } #>
		<# if ( data.error ) { #>
		<pre class="shutterpress-error">{{ data.error }}</pre>
		<# } #>
		<# if ( data.link ) { #>
		<a  target="_blank" href="{{ data.link.url }}" class="shutterpress-link">{{ data.link.text }}</a>
		<# } #>
		<# if ( data.retry ) { #>
		<button type="button" class="button media-button button-primary button-large retry">{{data.retry}}</button>
		<# } #>
	</div>
</script>