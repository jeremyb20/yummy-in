import { Component, OnInit } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var google;

@Component({
  selector: 'app-admin-master',
  templateUrl: './admin-master.component.html',
  styleUrls: ['./admin-master.component.scss']
})
export class AdminMasterComponent implements OnInit {
  loginForm: FormGroup;
  map;
  directionDisplay;
  directionsService;
  stepDisplay;
  markerArray = [];
  position;
  marker = null;
  polyline = null;
  poly2 = null;
  speed = 0.000005;
  wait = 1;
  infowindow = null;
  timerHandle = null;
  address: string;
  geocoder: any;
  steps = [];
  step = 50; // 5; // metres
  tick = 100; // milliseconds
  eol;
  k = 0;
  stepnum = 0;
  lastVertex = 1;
  directionsDisplay: any;
  endLocation:any
  icon: any;
  lat: any;
  lng: any;
  getPath: any;
  car = "M17.402,0H5.643C2.526,0,0,3.467,0,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644 V6.584C23.044,3.467,20.518,0,17.402,0z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z";


  constructor(private formBuilder: FormBuilder,private mapsAPILoader: MapsAPILoader) {
    this.mapsAPILoader.load().then(() => {
      var mapProp = {
        center: new google.maps.LatLng(9.93040049002793, -84.09062837772197),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      this.icon = {
        path: this.car,
        scale: .7,
        strokeColor: 'white',
        strokeWeight: .10,
        fillOpacity: 1,
        fillColor: '#404040',
        offset: '5%',
        // rotation: parseInt(heading[i]),
        anchor: new google.maps.Point(10, 25) // orig 10,50 back of car, 10,0 front of car, 10,25 center of car
      };
    });
  }

  get f() { return this.loginForm.controls; }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      start : ['', Validators.required],
      end : ['', Validators.required]
    });
  }
  
  createMarker(latlng, label, html) {
    var contentString = '<b>' + label + '</b><br>' + html;
    var marker = new google.maps.Marker({
        position: latlng,
        map: this.map,
        title: label,
        zIndex: Math.round(latlng.lat() * -100000) << 5
    });
    this.marker.myname = label;
    google.maps.event.addListener(marker, 'click', function () {
        this.infowindow.setContent(contentString);
        this.infowindow.open(this.map, marker);
    });
    return marker;
  }

  initialize() {
    this.infowindow = new google.maps.InfoWindow({
        size: new google.maps.Size(150, 50)
    });
    // Instantiate a directions service.
    this.directionsService = new google.maps.DirectionsService();

    // Create a map and center it on Manhattan.
    var myOptions = {
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    this.address = 'new york';
    this.geocoder = new google.maps.Geocoder();
    this.geocoder.geocode({
        'address': this.address
    }, function (results, status) {
        this.map.setCenter(results[0].geometry.location);
    });

    // Create a renderer for directions and bind it to the map.
    var rendererOptions = {
        map: this.map
    };
    this.directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);

    // Instantiate an info window to hold step text.
    this.stepDisplay = new google.maps.InfoWindow();

    this.polyline = new google.maps.Polyline({
        path: [],
        strokeColor: '#FF0000',
        strokeWeight: 3
    });
    this.poly2 = new google.maps.Polyline({
        path: [],
        strokeColor: '#FF0000',
        strokeWeight: 3
    });
  }

  calcRoute() {

    if (this.timerHandle) {
        clearTimeout(this.timerHandle);
    }
    if (this.marker) {
        this.marker.setMap(null);
    }
    this.polyline.setMap(null);
    this.poly2.setMap(null);
    this.directionsDisplay.setMap(null);
    this.polyline = new google.maps.Polyline({
        path: [],
        strokeColor: '#FF0000',
        strokeWeight: 3
    });
    this.poly2 = new google.maps.Polyline({
        path: [],
        strokeColor: '#FF0000',
        strokeWeight: 3
    });
    // Create a renderer for directions and bind it to the map.
    var rendererOptions = {
        map: this.map
    };
    this.directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    var start = (<HTMLInputElement>document.forms[0].elements[0]).value = this.f.start.value;;
    var end = (<HTMLInputElement>document.forms[0].elements[1]).value = this.f.end.value;;
    var travelMode = google.maps.DirectionsTravelMode.DRIVING;

    var request = {
        origin: start,
        destination: end,
        travelMode: travelMode
    };

    // Route the directions and pass the response to a
    // function to create markers for each step.
    this.directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            this.directionsDisplay.setDirections(response);

            var bounds = new google.maps.LatLngBounds();
            var route = response.routes[0];
            this.startLocation = new Object();
            this.endLocation = new Object();

            // For each route, display summary information.
            var path = response.routes[0].overview_path;
            var legs = response.routes[0].legs;
            for (var i = 0; i < legs.length; i++) {
                if (i === 0) {
                    this.startLocation.latlng = legs[i].start_location;
                    this.startLocation.address = legs[i].start_address;
                    //   marker = createMarker(legs[i].start_location, "start", legs[i].start_address, "green");
                }
                this.endLocation.latlng = legs[i].end_location;
                this.endLocation.address = legs[i].end_address;
                var steps = legs[i].steps;
                for (var j = 0; j < steps.length; j++) {
                    var nextSegment = steps[j].path;
                    for (var k = 0; k < nextSegment.length; k++) {
                        this.polyline.getPath().push(nextSegment[k]);
                        bounds.extend(nextSegment[k]);
                    }
                }
            }
            this.polyline.setMap(this.map);
            this.map.fitBounds(bounds);
            this.map.setZoom(18);
            this.startAnimation();
        }
    });
  }

  updatePoly(d) {
    // Spawn a new polyline every 20 vertices, because updating a 100-vertex poly is too slow
    if (this.poly2.getPath().getLength() > 20) {
        this.poly2 = new google.maps.Polyline([this.polyline.getPath().getAt(this.lastVertex - 1)]);
        // map.addOverlay(poly2)
    }

    if (this.polyline.GetIndexAtDistance(d) < this.lastVertex + 2) {
        if (this.poly2.getPath().getLength() > 1) {
            this.poly2.getPath().removeAt(this.poly2.getPath().getLength() - 1);
        }
        this.poly2.getPath().insertAt(this.poly2.getPath().getLength(), this.polyline.GetPointAtDistance(d));
    } else {
        this.poly2.getPath().insertAt(this.poly2.getPath().getLength(), this.endLocation.latlng);
    }
  }

  animate(d) {
    if (d > this.eol) {
        this.map.panTo(this.endLocation.latlng);
        this.marker.setPosition(this.endLocation.latlng);
        return;
    }
    var p = this.polyline.GetPointAtDistance(d);
    this.map.panTo(p);
    var lastPosn = this.marker.getPosition();
    this.marker.setPosition(p);
    var heading = google.maps.geometry.spherical.computeHeading(lastPosn, p);
    this.icon.rotation = heading;
    this.marker.setIcon(this.icon);
    this.updatePoly(d);
    this.timerHandle = setTimeout("animate(" + (d + this.step) + ")", this.tick);
  }

  startAnimation() {
    this.eol = this.polyline.Distance();
    this.map.setCenter(this.polyline.getPath().getAt(0));
    this.marker = new google.maps.Marker({
        position: this.polyline.getPath().getAt(0),
        map: this.map,
        icon: this.icon
    });

    this.poly2 = new google.maps.Polyline({
        path: [this.polyline.getPath().getAt(0)],
        strokeColor: "#0000FF",
        strokeWeight: 10
    });
    // map.addOverlay(poly2);
    setTimeout("animate(50)", 2000); // Allow time for the initial map display
    google.maps.event.addDomListener(window, 'load', this.initialize);

    google.maps.LatLng.prototype.distanceFrom = (newLatLng) => {
      var EarthRadiusMeters = 6378137.0; // meters
      var lat1 = this.lat();
      var lon1 = this.lng();
      var lat2 = newLatLng.lat();
      var lon2 = newLatLng.lng();
      var dLat = (lat2 - lat1) * Math.PI / 180;
      var dLon = (lon2 - lon1) * Math.PI / 180;
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = EarthRadiusMeters * c;
      return d;
  }
  
  google.maps.LatLng.prototype.latRadians =  ()=> {
      return this.lat() * Math.PI / 180;
  }
  
  google.maps.LatLng.prototype.lngRadians =  () => {
      return this.lng() * Math.PI / 180;
  }
  
  // === A method which returns the length of a path in metres ===
  google.maps.Polygon.prototype.Distance =  () => {
      var dist = 0;
      for (var i = 1; i < this.getPath().getLength(); i++) {
          dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i - 1));
      }
      return dist;
  }
  
  // === A method which returns a GLatLng of a point a given distance along the path ===
  // === Returns null if the path is shorter than the specified distance ===
  google.maps.Polygon.prototype.GetPointAtDistance =  (metres) => {
      // some awkward special cases
      if (metres == 0) return this.getPath().getAt(0);
      if (metres < 0) return null;
      if (this.getPath().getLength() < 2) return null;
      var dist = 0;
      var olddist = 0;
      for (var i = 1;
      (i < this.getPath().getLength() && dist < metres); i++) {
          olddist = dist;
          dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i - 1));
      }
      if (dist < metres) {
          return null;
      }
      var p1 = this.getPath().getAt(i - 2);
      var p2 = this.getPath().getAt(i - 1);
      var m = (metres - olddist) / (dist - olddist);
      return new google.maps.LatLng(p1.lat() + (p2.lat() - p1.lat()) * m, p1.lng() + (p2.lng() - p1.lng()) * m);
  }
  
  // === A method which returns an array of GLatLngs of points a given interval along the path ===
  google.maps.Polygon.prototype.GetPointsAtDistance = (metres) => {
      var next = metres;
      var points = [];
      // some awkward special cases
      if (metres <= 0) return points;
      var dist = 0;
      var olddist = 0;
      for (var i = 1;
      (i < this.getPath().getLength()); i++) {
          olddist = dist;
          dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i - 1));
          while (dist > next) {
              var p1 = this.getPath().getAt(i - 1);
              var p2 = this.getPath().getAt(i);
              var m = (next - olddist) / (dist - olddist);
              points.push(new google.maps.LatLng(p1.lat() + (p2.lat() - p1.lat()) * m, p1.lng() + (p2.lng() - p1.lng()) * m));
              next += metres;
          }
      }
      return points;
  }
  
  // === A method which returns the Vertex number at a given distance along the path ===
  // === Returns null if the path is shorter than the specified distance ===
  google.maps.Polygon.prototype.GetIndexAtDistance =  (metres) => {
      // some awkward special cases
      if (metres == 0) return this.getPath().getAt(0);
      if (metres < 0) return null;
      var dist = 0;
      var olddist = 0;
      for (var i = 1;
      (i < this.getPath().getLength() && dist < metres); i++) {
          olddist = dist;
          dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i - 1));
      }
      if (dist < metres) {
          return null;
      }
      return i;
  }
  // === Copy all the above functions to GPolyline ===
    google.maps.Polyline.prototype.Distance = google.maps.Polygon.prototype.Distance;
    google.maps.Polyline.prototype.GetPointAtDistance = google.maps.Polygon.prototype.GetPointAtDistance;
    google.maps.Polyline.prototype.GetPointsAtDistance = google.maps.Polygon.prototype.GetPointsAtDistance;
    google.maps.Polyline.prototype.GetIndexAtDistance = google.maps.Polygon.prototype.GetIndexAtDistance;
  }
  
  



}
