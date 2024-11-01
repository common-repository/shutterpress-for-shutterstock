<script type="text/html" id="tmpl-shutterpress-downloader">
	<div class="downloader">
		<button type="button" class="button media-button button-primary button-large download-shutterpress-image">{{data.download}}</button>
		<# if ( data.state ) { #>
		<span class="state">{{data.state}}</span>
		<# } #>
		<# if ( data.progress ) { #>
		<span class="progress">{{data.progress}}</span>
		<# } #>
	</div>
</script>