<script type="text/html" id="tmpl-shutterpress-attachment">
	<div class="attachment-preview js--select-attachment type-{{ data.type }} subtype-{{ data.subtype }} {{ data.orientation }}">
		<div class="thumbnail">
			<# if ( data.uploading ) { #>
			<div class="media-progress-bar">
				<div style="width: {{ data.percent }}%"></div>
			</div>
			<# } else if ( 'image' === data.type && data.sizes ) { #>
			<div class="centered">
				<img src="{{ data.size.url }}" draggable="false" alt=""/>
			</div>
			<# } else { #>
			<div class="centered">
				<# if ( data.image && data.image.src && data.image.src !== data.icon ) { #>
				<img src="{{ data.image.src }}" class="thumbnail" draggable="false" alt=""/>
				<# } else if ( data.sizes && data.sizes.medium ) { #>
				<img src="{{ data.sizes.medium.url }}" class="thumbnail" draggable="false" alt=""/>
				<# } else { #>
				<img src="{{ data.icon }}" class="icon" draggable="false" alt=""/>
				<# } #>
			</div>
			<div class="filename">
				<div>{{ data.filename }}</div>
			</div>
			<# } #>
		</div>
	</div>
	<# if ( data.buttons.check ) { #>
	<button type="button" class="check" tabindex="-1"><span class="media-modal-icon"></span><span
				class="screen-reader-text">Deselect</span></button>
	<button type="button" class="download" tabindex="-1"><span class="
dashicons-download"></span><span class="screen-reader-text">Download</span></button>
	<# } #>
</script>