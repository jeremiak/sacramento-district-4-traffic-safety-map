<script>
	import MapboxMap from '$lib/components/MapboxMap.svelte';

	export let data = {};
	let map = null
	const { bbox, bike, d4, onstreet, signals } = data;

	const layers = [
		{
			label: 'On street parking',
			toggle: isShown => {
				if (isShown) {
					map.setPaintProperty('onstreet', 'circle-opacity', 1)
				} else {
					map.setPaintProperty('onstreet', 'circle-opacity', 0)
				}
			}
		}
	]

	function handleMapLoad(e) {
		map = (window.map = e.detail);
		map.on('click', function handleClick(e) {
			console.log(e.lngLat);
		});

		map.fitBounds([
			[bbox[0], bbox[1]],
			[bbox[2], bbox[3]],
		], {
			padding: 30
		})

		map.addSource('d4', {
			type: 'geojson',
			data: d4
		})

		map.addSource('bike', {
			type: 'geojson',
			data: bike
		})

		map.addSource('onstreet', {
			type: 'geojson',
			data: onstreet,
		})

		map.addSource('signals', {
			type: 'geojson',
			data: signals
		})

		map.addLayer({
			id: 'd4-fill',
			source: 'd4',
			type: 'fill',
			paint: {
				'fill-color': '#000000',
				'fill-opacity': .1
			}
		})

		map.addLayer({
			id: 'd4-stroke',
			source: 'd4',
			type: 'line',
			paint: {
				'line-color': '#000000',
				'line-width': 2
			}
		})

		map.addLayer({
			id: 'bike-stroke',
			source: 'bike',
			type: 'line',
			paint: {
				'line-color': [
					'match',
					['get', 'speed'],
					35,
					'#8338ec',
					30,
					'#3a86ff',
					/* other */ '#ff006e'
				],
				'line-width': [
					'match',
					['get', 'speed'],
					35,
					3,
					30,
					2,
					/* other */ 1
				],
				'line-opacity': [
					'match',
					['get', 'withinD4'],
					'true',
					1,
					/* other */ .2
				]
			}
		})

		map.addLayer({
			id: 'onstreet',
			source: 'onstreet',
			type: 'circle',
			paint: {
				'circle-radius': 1.3,
				'circle-color': 'purple',
				'circle-opacity': 0
			}
		})

		// map.addLayer({
		// 	id: 'signals',
		// 	source: 'signals',
		// 	type: 'circle',
		// 	paint: {
		// 		'circle-radius': 3.3,
		// 		'circle-color': [
		// 			'match',
		// 			['get', 'withinD4'],
		// 			'true',
		// 			'rebeccapurple',
		// 			/* other */ '#000000'
		// 		],
		// 		'circle-opacity': [
		// 			'match',
		// 			['get', 'withinD4'],
		// 			'true',
		// 			1,
		// 			/* other */ 0
		// 		]
		// 	}
		// })
	}
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	<img src="https://www.cityofsacramento.org/-/media/Corporate/Files/Public-Works/Transportation/VisionZero/15mph-School-Zone-Citywide-Fact-Sheet-2.jpg?h=325&w=600&la=en">
	<div class="layers">
		<ul>
			{#each layers as layer}
			<li>
				<button>
					{layer.label}
				</button>
			</li>
			{/each}
		</ul>
	</div>
	<div class="map-container">
		<MapboxMap
			center={[-121.480462556308, 38.575296326239965]}
			interactive={false}
			zoom="12.94"
			on:loaded={handleMapLoad}
		/>
	</div>
</section>

<style lang="scss">
	.map-container {
		--min-height: 700px;
	}

	.layers {
		ul {
			list-style-type: none;
			padding: 0;
		}
	}
</style>
