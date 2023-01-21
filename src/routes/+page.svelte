<script>
	import { writable } from 'svelte/store';
	import MapboxMap from '$lib/components/MapboxMap.svelte';

	export let data = {};
	let map = null;
	const { bbox, bike, d4, onstreet, signals } = data;

	const layerToggles = writable([
		{
			id: 'd4',
			label: 'District 4',
			shown: true
		},
		{
			id: 'street-parking',
			label: 'Street parking',
			shown: false
		},
		{
			id: 'bike-routes',
			label: 'Bike routes within D4',
			shown: false
		},
		{
			id: 'bike-routes-speed',
			label: 'Road speeds along bike routes',
			shown: false
		}
	]);

	layerToggles.subscribe((next) => {
		if (!map) return;
		const d4 = next.find((d) => d.id === 'd4');
		const street = next.find((d) => d.id === 'street-parking');
		const bike = next.find((d) => d.id === 'bike-routes');
		const bikeRoadSpeed = next.find((d) => d.id === 'bike-routes-speed');

		if (d4.shown) {
			map.setPaintProperty('d4-fill', 'fill-opacity', 0.1);
			map.setPaintProperty('d4-stroke', 'line-opacity', 1);
		} else {
			map.setPaintProperty('d4-fill', 'fill-opacity', 0);
			map.setPaintProperty('d4-stroke', 'line-opacity', 0);
		}

		if (street.shown) {
			map.setPaintProperty('onstreet', 'circle-opacity', 0.5);
		} else {
			map.setPaintProperty('onstreet', 'circle-opacity', 0);
		}

		if (bikeRoadSpeed.shown) {
			map.setPaintProperty('bike-stroke', 'line-color', [
				'match',
				['get', 'speed'],
				35,
				'#8338ec',
				30,
				'#3a86ff',
				/* other */ '#ff006e'
			]);
			map.setPaintProperty('bike-stroke', 'line-width', [
				'match',
				['get', 'speed'],
				35,
				3,
				30,
				2,
				/* other */ 1
			]);
			map.setPaintProperty('bike-stroke', 'line-opacity', [
				'match',
				['get', 'withinD4'],
				'true',
				1,
				/* other */ 0.2
			]);
		} else if (bike.shown && !bikeRoadSpeed.shown) {
			map.setPaintProperty('bike-stroke', 'line-color', '#3a86ff')
			map.setPaintProperty('bike-stroke', 'line-width', 2)
			map.setPaintProperty('bike-stroke', 'line-opacity', [
				'match',
				['get', 'withinD4'],
				'true',
				1,
				/* other */ 0.2
			]);
		} else {
			map.setPaintProperty('bike-stroke', 'line-opacity', 0);
		}
	});

	function handleMapLoad(e) {
		map = window.map = e.detail;
		map.on('click', function handleClick(e) {
			console.log(e.lngLat);
		});

		map.fitBounds(
			[
				[bbox[0], bbox[1]],
				[bbox[2], bbox[3]]
			],
			{
				padding: 30
			}
		);

		map.addSource('d4', {
			type: 'geojson',
			data: d4
		});

		map.addSource('bike', {
			type: 'geojson',
			data: bike
		});

		map.addSource('onstreet', {
			type: 'geojson',
			data: onstreet
		});

		map.addSource('signals', {
			type: 'geojson',
			data: signals
		});

		map.addLayer({
			id: 'd4-fill',
			source: 'd4',
			type: 'fill',
			paint: {
				'fill-color': '#000000',
				'fill-opacity': 0.1
			}
		});

		map.addLayer({
			id: 'd4-stroke',
			source: 'd4',
			type: 'line',
			paint: {
				'line-color': '#000000',
				'line-width': 2
			}
		});

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
				'line-width': ['match', ['get', 'speed'], 35, 3, 30, 2, /* other */ 1],
				'line-opacity': 0 //['match', ['get', 'withinD4'], 'true', 1, /* other */ 0.2]
			}
		});

		map.addLayer({
			id: 'onstreet',
			source: 'onstreet',
			type: 'circle',
			paint: {
				'circle-radius': 1.3,
				'circle-color': 'purple',
				'circle-opacity': 0
			}
		});
	}
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	<h1>District 4 bike infrastructure</h1>
	<p><a href="https://www.cityofsacramento.org/-/media/Corporate/Files/Public-Works/Transportation/VisionZero/15mph-School-Zone-Citywide-Fact-Sheet-2.jpg?h=325&w=600&la=en">According to the City of Sacramento</a>, there is a 40% chance of a pedestrian or biker being killed if they are struck by a car going 30 MPH, which falls to a 5% chance of death if the car is going 20 MPH.</p>
	<div class="layers">
		<form
			on:change={(e) => {
				const { id, checked } = e.target;
				const match = $layerToggles.find((d) => d.id === id);

				match.shown = checked;

				$layerToggles = $layerToggles;
			}}
		>
			<fieldset>
				<legend>Show layers</legend>

				{#each $layerToggles as layer}
					<div>
						<input
							type="checkbox"
							value={layer.id}
							name={layer.id}
							id={layer.id}
							checked={layer.shown}
						/>
						<label for={layer.id}>{layer.label}</label>
					</div>
				{/each}
			</fieldset>
		</form>
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

	fieldset {
		display: flex;
		flex-direction: column;
		justify-content: center;
		margin-bottom: 1.2rem;
	}
</style>
