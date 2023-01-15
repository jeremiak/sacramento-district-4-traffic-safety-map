<!--
 @component
 A wrapper around [Mapbox GL](https://docs.mapbox.com/mapbox-gl-js/guides/) which handles updating the map when sources and/or layers change. Exposes the [Map object](https://docs.mapbox.com/mapbox-gl-js/api/map/) as the first argument passed to the `onMapLoad` prop.
 
Many props are simply passed right on through to Mapbox. Over time, we'll add the ones we need.

* `center`
* `dragRotate`
* `interactive`
* `layers`
* `sources`
* `styleUrl`
* `zoom`

There are a few props that we added on, all of which are optional:

* `source` - The text for data and source attribution
* `sourceUrl` - A URL to link the source text to

The component will dispatch a `load` event at the end of `map.on('load')`, passing the `map` object as the `detail`

-->

<script>
	import 'mapbox-gl/dist/mapbox-gl.css';
	import mapboxgl, { Map } from 'mapbox-gl';
	import { createEventDispatcher, afterUpdate, onMount } from 'svelte';

	export let center = [-119.449444, 37.166111];
	export let dragRotate = false;
	export let interactive = true;
	export let layers = [];
	export let source = null;
	export let sourceUrl = null;
	export let sources = [];
	export let styleUrl = 'mapbox://styles/jeremiak/clcx0253p000g15pg26svac3y?fresh=true';
	export let zoom = 4.2;

	let container;
	let map;
	let mapHasLoaded = false;

	const dispatch = createEventDispatcher()

	mapboxgl.accessToken =
		'pk.eyJ1IjoiamVyZW1pYWsiLCJhIjoiVlhLX3JnSSJ9.cCQVw4SYjd8CiNn7quiCPw';

	// https://docs.mapbox.com/mapbox-gl-js/api/map/#map#addlayer
	function upsertLayer(layer) {
		if (!layer) return;
		const { id, filter, layout, paint } = layer
		const existing = map.getLayer(id)
		
		if (!existing) {
			try {
			map.addLayer(layer, 'settlement-minor-label');
			return 
			} catch (e) {
				debugger
			}
		}

		if (layout) {
			for (const property in layout) {
				map.setLayoutProperty(id, property, layout[property])
			}
		}

		if (paint) {
			for (const property in paint) {
				map.setPaintProperty(id, property, paint[property])
			}
		}
		
		try {
			map.setFilter(id, filter || null)
		} catch (e) {
			debugger
		}
	}

	function upsertSource(source) {
		if (!source) return;
		const { data, id, type, url } = source;
		const options = {
			data,
			type
		};

		if (url) {
			options.url = url;
		} else if (data) {
			options.data = data;
		}

		try {
			// https://docs.mapbox.com/mapbox-gl-js/api/map/#map#addsource
			map.addSource(id, options);
		} catch (e) {
			if (e.message === 'There is already a source with this ID') {
				try {
					map.getSource(id).setData(data);
					return
				} catch (ee) {
					console.log('yo!', id, ee, options)
					debugger
				}
			}
		}
	}

	onMount(() => {
		if (!container) {
			console.log('bouncing early because container is false-y');
			return;
		}

		if (container instanceof HTMLDivElement !== true) {
			console.log('bouncing early because container is not an instance of an HTMLElement');
			debugger
			return;
		}

		map = new Map({
			center,
			container,
			dragRotate,
			interactive,
			style: styleUrl,
			zoom
		});

		function handleLoad() {
			sources.forEach((source) => {
				if (source) upsertSource(source);
			});
			layers.forEach((layer) => {
				if (layer) upsertLayer(layer);
			});
			mapHasLoaded = true;
			dispatch('loaded', map)
		}

		function handleZoom() {
			const currentZoom = map.getZoom();
			zoom = currentZoom;
		}

		map.on('zoom', handleZoom);
		map.on('load', handleLoad);

		return () => {
			map.off('zoom', handleZoom);
			map.off('load', handleLoad);
			map.remove();
		};
	});

	afterUpdate(() => {
		if (!mapHasLoaded || !map) {
			console.log('afterUpdate in map but returning because no map');
			return;
		}
		sources.forEach((source) => {
			upsertSource(source);
		});
		layers.forEach((layer) => {
			upsertLayer(layer);
		});
	});
</script>

<div class="map-container">
	<div class="map" bind:this={container}>
		{#if map}
			<slot />
		{/if}
	</div>
	{#if source}
		<p class="chart-source">
			Source:
			{#if sourceUrl}
				<a href={sourceUrl}>{source}</a>
			{:else}
				{source}
			{/if}
		</p>
	{/if}
</div>

<style lang="scss">
	.map-container {
		height: 100%;
		position: relative;
		width: 100%;
	}

	.map {
		height: 100%;
		margin-bottom: 1rem;
		min-height: var(--min-height, 400px);
		width: 100%;
	}
</style>
