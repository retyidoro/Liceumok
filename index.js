let app = new Vue({
  el: '#app',
  data: {
    szaknevek: ["Minden szak", "Bőr- és textilipar", "Faipari termékek gyártása", "Mezőgazdaság", "Az emberi test esztétikája és higiéniája", 
      "Építkezés, szerelés, közművek", "Elektronika", "Élelmiszeripar", "Természettudományok", "Gazdasági", "Mechanika", "Környezetvédelem", 
      "Reál Német", "Turizmus és élelmezés", "Elektromechanika", "Médiatermelés", "Ipari kémia", "Matematika-Informatika", "Filológia", 
      "Kereskedelem", "Erdészet", "Társadalomtudományok", "Építőanyagok"],
    szaktipusok: ["Minden szaktípus", "Szolgáltatások", "Műszaki", "Természeti erőforrások és környezetvédelem", "Humán", "Reál"],
    nyelvek: ["Mind a 7 nyelv", "magyar", "román", "szlovák", "ukrán", "horvát", "szerb", "német"],
    megyek: ["ERDÉLY", "ALBA", "ARAD", "BIHOR", "BISTRIȚA-NĂSĂUD", "BRAȘOV", "CARAȘ-SEVERIN", "CLUJ", "COVASNA", "HARGHITA", "HUNEDOARA", "MARAMUREȘ", "MUREȘ", "SALAJ", "SATU-MARE", "SIBIU", "TIMIȘ"],

    szaknev: "Minden szak",
    szaktipus: "Minden szaktípus",
    nyelv: "Mind a 7 nyelv",
    megye: "ERDÉLY",
    minden_adat: undefined,
    szurt_adat: undefined
  },
  
  //this happens when the page loads
  mounted() {
    
    //fetching geojson data from the github
    fetch("https://raw.githubusercontent.com/retyidoro/Liceumok/master/geodata.geojson")
      .then(
        function(response) {
          if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' +
              response.status);
            return;
          }
        
          // Examine the text in the response
          response.json().then(function(data) {
            this.minden_adat = data;
            var p = this.minden_adat; //putting in a parameter to use in mapbox
            console.log(this.minden_adat)
            //example horizontal stacked barchart
            document.getElementById("suli").innerHTML = "Példa Iskola Neve";
            document.getElementById("szakok").innerHTML = "szakok és elfoglalt/üres helyek száma:";
            var barOptions_stacked = {
              tooltips: {
                  enabled: false
              },
              hover :{
                  animationDuration:0
              },
              scales: {
                  xAxes: [{
                      ticks: {
                          beginAtZero:true,
                          fontFamily: "Arial",
                          fontSize:12
                      },
                      scaleLabel:{
                          display:false
                      },
                      gridLines: {
                      }, 
                      stacked: true
                  }],
                  yAxes: [{
                      gridLines: {
                          display:false,
                          color: "#fff",
                          zeroLineColor: "#fff",
                          zeroLineWidth: 0
                      },
                      ticks: {
                          fontFamily: "Arial",
                          fontSize:11
                      },
                      stacked: false
                  }]
              },
              legend:{
                  display:false
              },

              animation: {
                  onComplete: function () {
                      var chartInstance = this.chart;
                      var ctx = chartInstance.ctx;
                      ctx.textAlign = "left";
                      ctx.font = "Arial";
                      ctx.fillStyle = "#fff";
                  
                      Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) {
                          var meta = chartInstance.controller.getDatasetMeta(i);
                          Chart.helpers.each(meta.data.forEach(function (bar, index) {
                              data = dataset.data[index];
                              ctx.fillText(data, bar._model.x-25, bar._model.y+4);
                          }),this)
                      }),this);
                  }
              },
              pointLabelFontFamily : "Quadon Extra Bold",
              scaleFontFamily : "Quadon Extra Bold",
            };
  
            var ctx = document.getElementById("Chart1");
            par = ctx.parentNode

            par.removeChild(ctx);
            ctx = document.createElement("canvas")
            ctx.setAttribute("id", "Chart1")
            par.appendChild(ctx)
            var mychart = new Chart(ctx, {
                type: 'horizontalBar',
                data: {
                    labels: ["Példa szak: ut. bejutási média", "Példa szak: ut. bejutási média"],

                    datasets: [{
                        data: [20, 21],
                        backgroundColor: "rgba(63,103,126,1)",
                        hoverBackgroundColor: "rgba(50,90,100,1)"
                    },{
                        data: [5, 7],
                        backgroundColor: "rgba(163,103,126,1)",
                        hoverBackgroundColor: "rgba(140,85,100,1)"
                    }]
                },
              
                options: barOptions_stacked
            });
    
            //-----------------------------------------------------------mapbox map------------------------------------------------
            
            mapboxgl.accessToken = 'pk.eyJ1IjoicmV0eWlkb3JvIiwiYSI6ImNqdWlsczh5ZDFicTQ0M3BnMGw0NWlkZTQifQ.VsxfpzFMbwB1g6L4MoiTQg';
            var map = new mapboxgl.Map({
              container: 'map', // container id
              style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
              center: [23.5, 46.4], // starting position [lng, lat] Romania long: from 20.48333 to 28.86667., lat: 43.66667 to 48.18333 
              zoom: 6.2 // starting zoom
            });
            
            map.on('load', function() {
              // Add a new source from our GeoJSON data and set the
              // 'cluster' option to true. GL-JS will add the point_count property to your source data.
              map.addSource("schools", {
                type: "geojson",
                data: p,
                cluster: true,
                clusterMaxZoom: 10, // Max zoom to cluster points on
                clusterRadius: 45 // Radius of each cluster when clustering points (defaults to 50)
              });
            
              //klaszterek
              map.addLayer({
                id: "clusters",
                type: "circle",
                source: "schools",
                filter: ["has", "point_count"],
                paint: {
                  // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
                  // with three steps to implement three types of circles:
                  //   * Blue, 20px circles when point count is less than 100
                  //   * Yellow, 30px circles when point count is between 100 and 750
                  //   * Pink, 40px circles when point count is greater than or equal to 750
                  "circle-color": [
                    "step",
                    ["get", "point_count"],
                    "#00b3b3",
                    5,
                    "#cccc00",
                    15,
                    "#ff9933",
                    28,
                    "#e23075"
                  ],
                  "circle-opacity":0.7,
                  "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    15,
                    5,
                    20,
                    15,
                    25,
                    28,
                    35
                  ]
                }
              });
            
              //klaszter méretének száma
              map.addLayer({
                id: "cluster-count",
                type: "symbol",
                source: "schools",
                filter: ["has", "point_count"],
                layout: {
                  "text-field": "{point_count_abbreviated}",
                  "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                  "text-size": 13
                }
              });
            
              //klaszterezetlen pontok
              map.addLayer({
                id: "unclustered-point",
                type: "circle",
                source: "schools",
                filter: ["!", ["has", "point_count"]],
                paint: {
                  "circle-color": "#9966ff",
                  "circle-radius": 10,
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#fff",
                  "circle-opacity": 0.7
                }
              });
            
              map.on('click', 'unclustered-point', function (e) {
              
                var div = document.getElementById("Chart1");
                while(div.firstChild)
                  div.removeChild(div.firstChild);

                var coordinates = e.features[0].geometry.coordinates.slice();
                var nev = e.features[0].properties.nev;
                var hely = e.features[0].properties.hely;
                var szakszam = e.features[0].properties.szakszam;
                this.szakok = JSON.parse(e.features[0].properties.szakok);
              
                var szaknev = []
                var szaktipus = []
                var helyszam = []
                var elfoglalva = []
                var ureshely = []
                var nyelv = []
                var tobbnyelvu = []
                var profil = []
                var media = []
                for (var i = 0; i < this.szakok.length; ++i) {
                  szaknev.push(this.szakok[i].szaknev + ": " + parseFloat(this.szakok[i].ut_media));
                  szaktipus.push(this.szakok[i].szaktípus);
                  elfoglalva.push(parseInt(this.szakok[i].elfoglalva));
                  helyszam.push(parseInt(this.szakok[i].helyszam));
                  ureshely.push(helyszam[i] - elfoglalva[i]);
                  nyelv.push(this.szakok[i].nyelv);
                  tobbnyelvu.push(this.szakok[i].tobbnyelvu);
                  profil.push(this.szakok[i].profil);
                  media.push(parseFloat(this.szakok[i].ut_media));
                }
                console.log(this.szakok)
                var szoveg = "Szakok és elfoglalt helyek: <br />";

                document.getElementById("suli").innerHTML = nev;
                document.getElementById("szakok").innerHTML = szoveg;
                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                  coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                new mapboxgl.Popup()
                  .setLngLat(coordinates)
                  .setHTML(nev + '\n' + hely + ', ' + szakszam + " szak")
                  .addTo(map);
              
              
                  var barOptions_stacked = {
                    tooltips: {
                        enabled: false
                    },
                    hover :{
                        animationDuration:0
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                beginAtZero:true,
                                fontFamily: "Arial",
                                fontSize:12
                            },
                            scaleLabel:{
                                display:false
                            },
                            gridLines: {
                            }, 
                            stacked: true
                        }],
                        yAxes: [{
                            gridLines: {
                                display:false,
                                color: "#fff",
                                zeroLineColor: "#fff",
                                zeroLineWidth: 0
                            },
                            ticks: {
                                fontFamily: "Arial",
                                fontSize:11
                            },
                            stacked: false
                        }]
                    },
                    legend:{
                        display:false
                    },

                    animation: {
                        onComplete: function () {
                            var chartInstance = this.chart;
                            var ctx = chartInstance.ctx;
                            ctx.textAlign = "left";
                            ctx.font = "Arial";
                            ctx.fillStyle = "#fff";
                        
                            Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) {
                                var meta = chartInstance.controller.getDatasetMeta(i);
                                Chart.helpers.each(meta.data.forEach(function (bar, index) {
                                    data = dataset.data[index];
                                    if(data != 0) {
                                      if(data < 5){
                                          ctx.fillText(data, bar._model.x-6, bar._model.y+4);
                                      } else {
                                        if(data < 100) {
                                          ctx.fillText(data, bar._model.x-20, bar._model.y+4);
                                        }
                                        else {
                                          ctx.fillText(data, bar._model.x-35, bar._model.y+4);
                                        }
                                      }
                                    }
                                }),this)
                            }),this);
                        }
                    },
                    pointLabelFontFamily : "Quadon Extra Bold",
                    scaleFontFamily : "Quadon Extra Bold",
                };

                var ctx = document.getElementById("Chart1");
                par = ctx.parentNode

                par.removeChild(ctx);
                ctx = document.createElement("canvas")
                ctx.setAttribute("id", "Chart1")
                par.appendChild(ctx)
                var mychart = new Chart(ctx, {
                    type: 'horizontalBar',
                    data: {
                        labels: szaknev,

                        datasets: [{
                            data: elfoglalva,
                            backgroundColor: "rgba(63,103,126,1)",
                            hoverBackgroundColor: "rgba(50,90,100,1)"
                        },{
                            data: ureshely,
                            backgroundColor: "rgba(163,103,126,1)",
                            hoverBackgroundColor: "rgba(140,85,100,1)"
                        }]
                    },
                  
                    options: barOptions_stacked
                });

                });
              
                // Change the cursor to a pointer when the mouse is over the places layer.
                map.on('mouseenter', "unclustered-point", function () {
                  map.getCanvas().style.cursor = 'pointer';
                });
              
                // Change it back to a pointer when it leaves.
                map.on('mouseleave', "unclustered-point", function () {
                  map.getCanvas().style.cursor = '';
                });
              })       
            });
          })
          .catch(function(error) {
            // If there is any error you will catch them here
            console.log(error, "nem sikerult fetchelni")
          });
            
        },

  methods: {

    terkep() {
      var p = this.szurt_adat;
      mapboxgl.accessToken = 'pk.eyJ1IjoicmV0eWlkb3JvIiwiYSI6ImNqdWlsczh5ZDFicTQ0M3BnMGw0NWlkZTQifQ.VsxfpzFMbwB1g6L4MoiTQg';
            var map = new mapboxgl.Map({
              container: 'map', // container id
              style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
              center: [23.5, 46.4], // starting position [lng, lat] Romania long: from 20.48333 to 28.86667., lat: 43.66667 to 48.18333 
              zoom: 6.2 // starting zoom
            });
            
            map.on('load', function() {
              // Add a new source from our GeoJSON data and set the
              // 'cluster' option to true. GL-JS will add the point_count property to your source data.
              map.addSource("schools", {
                type: "geojson",
                data: p,
                cluster: true,
                clusterMaxZoom: 10, // Max zoom to cluster points on
                clusterRadius: 45 // Radius of each cluster when clustering points (defaults to 50)
              });
            
              //klaszterek
              map.addLayer({
                id: "clusters",
                type: "circle",
                source: "schools",
                filter: ["has", "point_count"],
                paint: {
                  // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
                  // with three steps to implement three types of circles:
                  //   * Blue, 20px circles when point count is less than 100
                  //   * Yellow, 30px circles when point count is between 100 and 750
                  //   * Pink, 40px circles when point count is greater than or equal to 750
                  "circle-color": [
                    "step",
                    ["get", "point_count"],
                    "#00b3b3",
                    5,
                    "#cccc00",
                    15,
                    "#ff9933",
                    28,
                    "#e23075"
                  ],
                  "circle-opacity":0.7,
                  "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    15,
                    5,
                    20,
                    15,
                    25,
                    28,
                    35
                  ]
                }
              });
            
              //klaszter méretének száma
              map.addLayer({
                id: "cluster-count",
                type: "symbol",
                source: "schools",
                filter: ["has", "point_count"],
                layout: {
                  "text-field": "{point_count_abbreviated}",
                  "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                  "text-size": 13
                }
              });
            
              //klaszterezetlen pontok
              map.addLayer({
                id: "unclustered-point",
                type: "circle",
                source: "schools",
                filter: ["!", ["has", "point_count"]],
                paint: {
                  "circle-color": "#9966ff",
                  "circle-radius": 10,
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#fff",
                  "circle-opacity": 0.7
                }
              });
            
              map.on('click', 'unclustered-point', function (e) {
              
                var div = document.getElementById("Chart1");
                while(div.firstChild)
                  div.removeChild(div.firstChild);

                var coordinates = e.features[0].geometry.coordinates.slice();
                var nev = e.features[0].properties.nev;
                var hely = e.features[0].properties.hely;
                var szakszam = e.features[0].properties.szakszam;
                this.szakok = JSON.parse(e.features[0].properties.szakok);
              
                var szaknev = []
                var szaktipus = []
                var helyszam = []
                var elfoglalva = []
                var ureshely = []
                var nyelv = []
                var tobbnyelvu = []
                var profil = []
                var media = []
                for (var i = 0; i < this.szakok.length; ++i) {
                  szaknev.push(this.szakok[i].szaknev + ": " + parseFloat(this.szakok[i].ut_media));
                  szaktipus.push(this.szakok[i].szaktípus);
                  elfoglalva.push(parseInt(this.szakok[i].elfoglalva));
                  helyszam.push(parseInt(this.szakok[i].helyszam));
                  ureshely.push(helyszam[i] - elfoglalva[i]);
                  nyelv.push(this.szakok[i].nyelv);
                  tobbnyelvu.push(this.szakok[i].tobbnyelvu);
                  profil.push(this.szakok[i].profil);
                  media.push(parseFloat(this.szakok[i].ut_media));
                }
                console.log(this.szakok)
                var szoveg = "Szakok és elfoglalt helyek: <br />";

                document.getElementById("suli").innerHTML = nev;
                document.getElementById("szakok").innerHTML = szoveg;
                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                  coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                new mapboxgl.Popup()
                  .setLngLat(coordinates)
                  .setHTML(nev + '\n' + hely + ', ' + szakszam + " szak")
                  .addTo(map);
              
              
                  var barOptions_stacked = {
                    tooltips: {
                        enabled: false
                    },
                    hover :{
                        animationDuration:0
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                beginAtZero:true,
                                fontFamily: "Arial",
                                fontSize:12
                            },
                            scaleLabel:{
                                display:false
                            },
                            gridLines: {
                            }, 
                            stacked: true
                        }],
                        yAxes: [{
                            gridLines: {
                                display:false,
                                color: "#fff",
                                zeroLineColor: "#fff",
                                zeroLineWidth: 0
                            },
                            ticks: {
                                fontFamily: "Arial",
                                fontSize:11
                            },
                            stacked: false
                        }]
                    },
                    legend:{
                        display:false
                    },

                    animation: {
                        onComplete: function () {
                            var chartInstance = this.chart;
                            var ctx = chartInstance.ctx;
                            ctx.textAlign = "left";
                            ctx.font = "Arial";
                            ctx.fillStyle = "#fff";
                        
                            Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) {
                                var meta = chartInstance.controller.getDatasetMeta(i);
                                Chart.helpers.each(meta.data.forEach(function (bar, index) {
                                    data = dataset.data[index];
                                    if(data != 0) {
                                      if(data < 5){
                                          ctx.fillText(data, bar._model.x-6, bar._model.y+4);
                                      } else {
                                        if(data < 100) {
                                          ctx.fillText(data, bar._model.x-20, bar._model.y+4);
                                        }
                                        else {
                                          ctx.fillText(data, bar._model.x-35, bar._model.y+4);
                                        }
                                      }
                                    }
                                }),this)
                            }),this);
                        }
                    },
                    pointLabelFontFamily : "Quadon Extra Bold",
                    scaleFontFamily : "Quadon Extra Bold",
                };

                var ctx = document.getElementById("Chart1");
                par = ctx.parentNode

                par.removeChild(ctx);
                ctx = document.createElement("canvas")
                ctx.setAttribute("id", "Chart1")
                par.appendChild(ctx)
                var mychart = new Chart(ctx, {
                    type: 'horizontalBar',
                    data: {
                        labels: szaknev,

                        datasets: [{
                            data: elfoglalva,
                            backgroundColor: "rgba(63,103,126,1)",
                            hoverBackgroundColor: "rgba(50,90,100,1)"
                        },{
                            data: ureshely,
                            backgroundColor: "rgba(163,103,126,1)",
                            hoverBackgroundColor: "rgba(140,85,100,1)"
                        }]
                    },
                  
                    options: barOptions_stacked
                });

                });
              
                // Change the cursor to a pointer when the mouse is over the places layer.
                map.on('mouseenter', "unclustered-point", function () {
                  map.getCanvas().style.cursor = 'pointer';
                });
              
                // Change it back to a pointer when it leaves.
                map.on('mouseleave', "unclustered-point", function () {
                  map.getCanvas().style.cursor = '';
                });
              }) 
    },

    async szur() {
      var response = await fetch("https://raw.githubusercontent.com/retyidoro/Liceumok/master/geodata.geojson"); 
      //console.log("megvarta", response.json()); // this line will "wait" for the previous to be completed
      var megye = [this.megye]
      var nyelv = [this.nyelv]
      var szaktipus = [this.szaktipus]
      var szaknev = [this.szaknev]

      var megyek = this.megyek
      var nyelvek = this.nyelvek
      var szaknevek = this.szaknevek
      var szaktipusok = this.szaktipusok

      response.json().then(function(data) { //the response dataset
        this.minden_adat = data;

        this.szurt_adat = { //building up the filtered data
          "type": "FeatureCollection",
          "features": []
        }

        console.log("szures", szaknev, szaktipus, nyelv, megye)
        var len = this.minden_adat.features.length

        if(megye[0] == "ERDÉLY") {
          megye = megyek
        }
        if(nyelv[0] == "Mind a 7 nyelv") {
          nyelv = nyelvek
        }
        if(szaktipus[0] == "Minden szaktípus") {
          szaktipus = szaktipusok
        }
        if(szaknev[0] == "Minden szak") {
          szaknev = szaknevek
        }

        //megye szurese
        var megye_filter = []
        for (var i = 0; i < len; i++) {
          if(megye.includes(this.minden_adat.features[i].properties.hely)){
            megye_filter.push(this.minden_adat.features[i]);
          }
        }

        //nyelv szurese
        var nyelv_filter = []
        for (var i = 0; i < megye_filter.length; ++i) {
          suli_nyelvei = []
          for (var j = 0; j < megye_filter[i].properties.szakok.length; ++j) {
            suli_nyelvei.push(megye_filter[i].properties.szakok[j].nyelv)
          }
          //console.log("suli nyelvei ", suli_nyelvei)
          for (var k = 0; k < suli_nyelvei.length; ++k) {
            if (nyelv.includes(suli_nyelvei[k])) {
              nyelv_filter.push(megye_filter[i])
              break
            }
          }
        }

        //szaktipus szurese valami baj van a humánnal
        /*var szaktipus_filter = []
        for (var i = 0; i < nyelv_filter.length; ++i) {
          suli_szaktipusai = []
          for (var j = 0; j < nyelv_filter[i].properties.szakok.length; ++j) {
            suli_szaktipusai.push(nyelv_filter[i].properties.szakok[j].szaktipus)
            console.log(nyelv_filter[i].properties.szakok[j].szaktipus)
          }
          //console.log("suli szaktipusai", suli_szaktipusai)
          for (var k = 0; k < suli_szaktipusai.length; ++k) {
            if (szaktipus.includes(suli_szaktipusai[k])) {
              szaktipus_filter.push(nyelv_filter[i])
              break
            }
          }
        }*/

        //szak szurese
        var szak_filter = []
        for (var i = 0; i < nyelv_filter.length; ++i) {
          suli_szakjai = []
          for (var j = 0; j < nyelv_filter[i].properties.szakok.length; ++j) {
            suli_szakjai.push(nyelv_filter[i].properties.szakok[j].szaknev)
          }
          //console.log("suli szakjai", suli_szakjai)
          for (var k = 0; k < suli_szakjai.length; ++k) {
            if (szaknev.includes(suli_szakjai[k])) {
              szak_filter.push(nyelv_filter[i])
              break
            }
          }
        }

        this.szurt_adat.features = szak_filter
        var s = this.szurt_adat
        mapboxgl.accessToken = 'pk.eyJ1IjoicmV0eWlkb3JvIiwiYSI6ImNqdWlsczh5ZDFicTQ0M3BnMGw0NWlkZTQifQ.VsxfpzFMbwB1g6L4MoiTQg';
            var map = new mapboxgl.Map({
              container: 'map', // container id
              style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
              center: [23.5, 46.4], // starting position [lng, lat] Romania long: from 20.48333 to 28.86667., lat: 43.66667 to 48.18333 
              zoom: 6.2 // starting zoom
            });
            
            map.on('load', function() {
              // Add a new source from our GeoJSON data and set the
              // 'cluster' option to true. GL-JS will add the point_count property to your source data.
              map.addSource("schools", {
                type: "geojson",
                data: s,
                cluster: true,
                clusterMaxZoom: 10, // Max zoom to cluster points on
                clusterRadius: 45 // Radius of each cluster when clustering points (defaults to 50)
              });
            
              //klaszterek
              map.addLayer({
                id: "clusters",
                type: "circle",
                source: "schools",
                filter: ["has", "point_count"],
                paint: {
                  // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
                  // with three steps to implement three types of circles:
                  //   * Blue, 20px circles when point count is less than 100
                  //   * Yellow, 30px circles when point count is between 100 and 750
                  //   * Pink, 40px circles when point count is greater than or equal to 750
                  "circle-color": [
                    "step",
                    ["get", "point_count"],
                    "#00b3b3",
                    5,
                    "#cccc00",
                    15,
                    "#ff9933",
                    28,
                    "#e23075"
                  ],
                  "circle-opacity":0.7,
                  "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    15,
                    5,
                    20,
                    15,
                    25,
                    28,
                    35
                  ]
                }
              });
            
              //klaszter méretének száma
              map.addLayer({
                id: "cluster-count",
                type: "symbol",
                source: "schools",
                filter: ["has", "point_count"],
                layout: {
                  "text-field": "{point_count_abbreviated}",
                  "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                  "text-size": 13
                }
              });
            
              //klaszterezetlen pontok
              map.addLayer({
                id: "unclustered-point",
                type: "circle",
                source: "schools",
                filter: ["!", ["has", "point_count"]],
                paint: {
                  "circle-color": "#9966ff",
                  "circle-radius": 10,
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#fff",
                  "circle-opacity": 0.7
                }
              });
            
              map.on('click', 'unclustered-point', function (e) {
              
                var div = document.getElementById("Chart1");
                while(div.firstChild)
                  div.removeChild(div.firstChild);

                var coordinates = e.features[0].geometry.coordinates.slice();
                var nev = e.features[0].properties.nev;
                var hely = e.features[0].properties.hely;
                var szakszam = e.features[0].properties.szakszam;
                this.szakok = JSON.parse(e.features[0].properties.szakok);
              
                var szaknev = []
                var szaktipus = []
                var helyszam = []
                var elfoglalva = []
                var ureshely = []
                var nyelv = []
                var tobbnyelvu = []
                var profil = []
                var media = []
                for (var i = 0; i < this.szakok.length; ++i) {
                  szaknev.push(this.szakok[i].szaknev + ": " + parseFloat(this.szakok[i].ut_media));
                  szaktipus.push(this.szakok[i].szaktípus);
                  elfoglalva.push(parseInt(this.szakok[i].elfoglalva));
                  helyszam.push(parseInt(this.szakok[i].helyszam));
                  ureshely.push(helyszam[i] - elfoglalva[i]);
                  nyelv.push(this.szakok[i].nyelv);
                  tobbnyelvu.push(this.szakok[i].tobbnyelvu);
                  profil.push(this.szakok[i].profil);
                  media.push(parseFloat(this.szakok[i].ut_media));
                }
                console.log(this.szakok)
                var szoveg = "Szakok és elfoglalt helyek: <br />";

                document.getElementById("suli").innerHTML = nev;
                document.getElementById("szakok").innerHTML = szoveg;
                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                  coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                new mapboxgl.Popup()
                  .setLngLat(coordinates)
                  .setHTML(nev + '\n' + hely + ', ' + szakszam + " szak")
                  .addTo(map);
              
              
                  var barOptions_stacked = {
                    tooltips: {
                        enabled: false
                    },
                    hover :{
                        animationDuration:0
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                beginAtZero:true,
                                fontFamily: "Arial",
                                fontSize:12
                            },
                            scaleLabel:{
                                display:false
                            },
                            gridLines: {
                            }, 
                            stacked: true
                        }],
                        yAxes: [{
                            gridLines: {
                                display:false,
                                color: "#fff",
                                zeroLineColor: "#fff",
                                zeroLineWidth: 0
                            },
                            ticks: {
                                fontFamily: "Arial",
                                fontSize:11
                            },
                            stacked: false
                        }]
                    },
                    legend:{
                        display:false
                    },

                    animation: {
                        onComplete: function () {
                            var chartInstance = this.chart;
                            var ctx = chartInstance.ctx;
                            ctx.textAlign = "left";
                            ctx.font = "Arial";
                            ctx.fillStyle = "#fff";
                        
                            Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) {
                                var meta = chartInstance.controller.getDatasetMeta(i);
                                Chart.helpers.each(meta.data.forEach(function (bar, index) {
                                    data = dataset.data[index];
                                    if(data != 0) {
                                      if(data < 5){
                                          ctx.fillText(data, bar._model.x-6, bar._model.y+4);
                                      } else {
                                        if(data < 100) {
                                          ctx.fillText(data, bar._model.x-20, bar._model.y+4);
                                        }
                                        else {
                                          ctx.fillText(data, bar._model.x-35, bar._model.y+4);
                                        }
                                      }
                                    }
                                }),this)
                            }),this);
                        }
                    },
                    pointLabelFontFamily : "Quadon Extra Bold",
                    scaleFontFamily : "Quadon Extra Bold",
                };

                var ctx = document.getElementById("Chart1");
                par = ctx.parentNode

                par.removeChild(ctx);
                ctx = document.createElement("canvas")
                ctx.setAttribute("id", "Chart1")
                par.appendChild(ctx)
                var mychart = new Chart(ctx, {
                    type: 'horizontalBar',
                    data: {
                        labels: szaknev,

                        datasets: [{
                            data: elfoglalva,
                            backgroundColor: "rgba(63,103,126,1)",
                            hoverBackgroundColor: "rgba(50,90,100,1)"
                        },{
                            data: ureshely,
                            backgroundColor: "rgba(163,103,126,1)",
                            hoverBackgroundColor: "rgba(140,85,100,1)"
                        }]
                    },
                  
                    options: barOptions_stacked
                });

                });
              
                // Change the cursor to a pointer when the mouse is over the places layer.
                map.on('mouseenter', "unclustered-point", function () {
                  map.getCanvas().style.cursor = 'pointer';
                });
              
                // Change it back to a pointer when it leaves.
                map.on('mouseleave', "unclustered-point", function () {
                  map.getCanvas().style.cursor = '';
                });
              }) 
      })
    }
  }
})