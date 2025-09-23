let geoWatchId = null;
let userMarker = null;
let accuracyCircle = null;

function startLocate() {
  if (!('geolocation' in navigator)) {
    alert('이 브라우저는 위치 정보를 지원하지 않아요.');
    return;
  }
  geoWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const latlng = [latitude, longitude];

      if (!userMarker) {
        userMarker = L.marker(latlng).addTo(map).bindPopup('내 위치');
        accuracyCircle = L.circle(latlng, { radius: accuracy }).addTo(map);
      } else {
        userMarker.setLatLng(latlng);
        accuracyCircle.setLatLng(latlng).setRadius(accuracy);
      }
      // 최초 혹은 이동 시 보기 좋게 줌인
      if (map.getZoom() < 15) map.setView(latlng, 16, { animate: true });
    },
    (err) => {
      alert('위치 권한이 거부되었거나 오류가 발생했습니다: ' + err.message);
      stopLocate();
    },
    { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
  );
}

function stopLocate() {
  if (geoWatchId !== null) {
    navigator.geolocation.clearWatch(geoWatchId);
    geoWatchId = null;
  }
  if (userMarker) {
    map.removeLayer(userMarker);
    userMarker = null;
  }
  if (accuracyCircle) {
    map.removeLayer(accuracyCircle);
    accuracyCircle = null;
  }
}

function toggleLocate() {
  if (geoWatchId === null) {
    startLocate();
  } else {
    stopLocate();
  }
}

// ⬇️ action 지원하도록 컨트롤 수정
const CustomButtonControl = L.Control.extend({
  options: { position: 'topright' },
  initialize: function (icon, color, link, action) {
    this.icon = icon;
    this.color = color;
    this.link = link;
    this.action = action; // 새로 추가
  },
  onAdd: function () {
    const container = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
    container.innerHTML = `<i class="${this.icon}"></i>`;
    container.style.backgroundColor = this.color;
    container.style.width = '40px';
    container.style.height = '40px';
    container.style.cursor = 'pointer';
    container.title = this.action === 'locate' ? '내 위치 추적/중지' : '';

    if (this.action === 'locate') {
      container.onclick = () => toggleLocate();
    } else {
      container.onclick = () => window.open(this.link, '_blank');
    }
    return container;
  },
});

// 컨트롤 생성 시 action까지 넘겨주기
buttonConfigs.forEach(cfg => {
  map.addControl(new CustomButtonControl(cfg.icon, cfg.color, cfg.link, cfg.action));
});
