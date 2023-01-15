import * as turf from '@turf/turf'
import bike from '$lib/data/Bike_Master_Plan_Facilities.json'
import districts from '$lib/data/Council_Districts.json'
import parking from '$lib/data/on-street-allowed.json'
import signals from '$lib/data/City_of_Sacramento_Traffic_Signals.json'

const d4 = districts.features.find(d => {
    return d.properties.DISTNUM === '4'
})

const d4Bbox = turf.bbox(d4)

const speedObjId = {
    '1412': 35, // C ST
    '2774': 35, // C ST
    '1225': 35, // C ST
    '2120': 35, // C ST
    '357': 35, // C ST
    '2885': 35, // C ST
    '5138': 35, // N 6TH
    '5139': 35, // N 6TH
}
const speed30 = [
    '5TH ST',
    '7TH ST',
    '9TH ST',
    '10TH ST',
    '16TH ST',
    '19TH ST',
    '29TH ST',
    'ALHAMBRA BLVD',
    'CAPITOL AVE',
    'CAPITOL MALL',
    'G ST',
    'J ST',
    'P ST',
    'Q ST',
    'S ST',
    'T ST'
]
const speed35 = [
    'ELVAS AVE',
    'FOLSOM BLVD',
    'N 7TH ST'
]

bike.features.forEach(feature => {
    const { FULLSTREET, OBJECTID } = feature.properties
    const isIntersecting = turf.booleanIntersects(feature, d4)
    feature.properties.withinD4 = isIntersecting ? "true" : "false"

    let postedSpeed = 20

    if (speed30.includes(FULLSTREET)) {
        postedSpeed = 30
    } else if (speed35.includes(FULLSTREET)) {
        postedSpeed = 35
    }

    if (speedObjId[OBJECTID]) {
        postedSpeed = speedObjId[OBJECTID]
    }

    feature.properties.speed = postedSpeed
})

const onstreet = {
    type: 'FeatureCollection',
    features: parking.features.filter(feature => {
        const isWithinD4 = turf.booleanPointInPolygon(feature, d4)
        return isWithinD4
    })
}

signals.features.forEach(feature => {
    const isWithinD4 = turf.booleanPointInPolygon(feature, d4)
    feature.properties.withinD4 = isWithinD4 ? "true" : "false"
})

export function load() {
    return {
        bbox: d4Bbox,
        bike,
        d4,
        onstreet,
        signals
    };
}