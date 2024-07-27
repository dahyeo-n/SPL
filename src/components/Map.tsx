import React, { useEffect, useRef } from 'react';

import { Tooltip } from '@nextui-org/tooltip';

declare global {
  interface Window {
    kakao: any;
  }
}

interface MapProps {
  address: string;
}

const Map: React.FC<MapProps> = ({ address }) => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scriptId = 'kakao-map-script';

    const setMap = () => {
      // 카카오 맵 Geocoder 인스턴스 생성
      const geocoder = new window.kakao.maps.services.Geocoder();

      // 주소로 좌표 검색
      geocoder.addressSearch(address, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

          // 지도 생성 옵션 설정
          const options = {
            center: coords,
            level: 3,
          };

          // 지도 생성
          const map = new window.kakao.maps.Map(mapContainer.current, options);

          // 마커 생성 및 지도에 추가
          new window.kakao.maps.Marker({
            map: map,
            position: coords,
          });

          // 카카오맵 검색결과로 이동하는 클릭 이벤트 핸들러 추가
          window.kakao.maps.event.addListener(map, 'click', function () {
            const encodedAddress = encodeURIComponent(address);
            const kakaoMapUrl = `https://map.kakao.com/link/search/${encodedAddress}`;
            window.open(kakaoMapUrl, '_blank');
          });
        }
      });
    };

    // 카카오 맵 스크립트가 이미 페이지에 로드된 경우 바로 맵 설정
    if (window.kakao && window.kakao.maps) {
      setMap();
    } else if (!document.getElementById(scriptId)) {
      // 카카오 맵 스크립트가 로드되지 않은 경우 스크립트 로드
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_KAKAO_MAP_API_KEY}&libraries=services,clusterer&autoload=false`;
      document.head.appendChild(script);

      script.onload = () => window.kakao.maps.load(setMap);
    }
  }, [address]);

  return (
    <Tooltip content='카카오맵으로 이동해서 위치 자세히 보기'>
      <div ref={mapContainer} className='w-100% h-[350px]' />
    </Tooltip>
  );
};

export default Map;
