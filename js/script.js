let map;
let directionsService;
let directionsRenderer;
let shelters = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 34.6937, lng: 135.5023 }, // 大阪市役所周辺
    zoom: 12,
    gestureHandling: "greedy" // スクロールで拡大縮小しない
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  loadShelters();
}

function loadShelters() {
  fetch("shelters.csv")
    .then((res) => res.text())
    .then((csv) => {
      const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
      shelters = parsed.data.map((row) => ({
        name: row.name,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
      }));

      // すべての避難所を地図に表示
      shelters.forEach((shelter) => {
        if (!isNaN(shelter.lat) && !isNaN(shelter.lng)) {
          new google.maps.Marker({
            position: { lat: shelter.lat, lng: shelter.lng },
            map,
            title: shelter.name,
          });
        }
      });

      locateUser();
    })
    .catch((err) => {
      alert("避難所データの読み込みに失敗しました");
      console.error(err);
    });
}

function locateUser() {
  if (!navigator.geolocation) {
    fallbackToDefaultLocation();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const userLat = pos.coords.latitude;
      const userLng = pos.coords.longitude;

      new google.maps.Marker({
        position: { lat: userLat, lng: userLng },
        map,
        title: "現在地",
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      });

      findNearestShelter(userLat, userLng);
    },
    (err) => {
      console.warn("位置情報エラー:", err);
      fallbackToDefaultLocation();
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function fallbackToDefaultLocation() {
  const fallbackLat = 34.6937;
  const fallbackLng = 135.5023;

  alert("位置情報の取得に失敗したため、大阪市役所を起点とします。");

  new google.maps.Marker({
    position: { lat: fallbackLat, lng: fallbackLng },
    map,
    title: "仮の現在地（大阪市役所）",
    icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  });

  findNearestShelter(fallbackLat, fallbackLng);
}

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findNearestShelter(userLat, userLng) {
  if (shelters.length === 0) return;

  let nearest = null;
  let minDist = Infinity;

  for (const shelter of shelters) {
    const dist = getDistance(userLat, userLng, shelter.lat, shelter.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = shelter;
    }
  }

  if (nearest) {
    new google.maps.Marker({
      position: { lat: nearest.lat, lng: nearest.lng },
      map,
      title: `最寄り: ${nearest.name}`,
      icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    });

    showRoute(userLat, userLng, nearest.lat, nearest.lng);
  } else {
    alert("最寄りの避難所が見つかりませんでした。");
  }
}

function showRoute(userLat, userLng, destLat, destLng) {
  if (!userLat || !userLng || !destLat || !destLng) {
    alert("ルート用の座標が不正です。");
    console.error("無効な座標:", { userLat, userLng, destLat, destLng });
    return;
  }

  const request = {
    origin: { lat: userLat, lng: userLng },
    destination: { lat: destLat, lng: destLng },
    travelMode: google.maps.TravelMode.WALKING,
  };

  directionsService.route(request, (result, status) => {
    if (status === "OK") {
      directionsRenderer.setDirections(result);
    } else {
      alert("ルート表示に失敗しました: " + status);
      console.error("Directions API エラー:", status, request);
    }
  });
}
