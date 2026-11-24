<template>
  <a-spin :spinning="loading">
    <div class="lr-block" ref="mapRef"></div>
  </a-spin>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { createNamespace } from '../utils/components';
  import { useFramework } from '../utils/useFramework';
  import loadMap from './loadMap';

  defineOptions({ name: createNamespace('map').name });

  const props = defineProps({
    /**
     * @zh 详细地址
     * @vModel
     */
    address: String,
    /**
     * @zh 经度
     * @vModel
     */
    lng: Number,
    /**
     * @zh 纬度
     * @vModel
     */
    lat: Number,
  });

  const emit = defineEmits({
    'update:address': (val: string) => true,
    'update:lng': (val: number) => true,
    'update:lat': (val: number) => true,

    change: (data: { value: { address: string; lng: number; lat: number } }) => true,
  });

  const { mapKey } = useFramework({});
  const loading = ref(true);
  const mapRef = ref();
  let baiduMap: any = null;
  let mapObj: any = null;
  let mk: any = null; // Marker实例
  let geolocationControl: any = null;

  const init = async () => {
    loading.value = true;
    baiduMap = await loadMap(mapKey);

    if (mapObj != null) {
      pSetPoint(props.lng, props.lat);
      loading.value = false;
      return;
    }

    // 1、挂载地图
    mapObj = new baiduMap.Map(mapRef.value, { enableMapClick: false });
    const point = new baiduMap.Point(121.480248, 31.236276); // 上海定位 后续在做调整
    mapObj.centerAndZoom(point, 17);

    // 2、设置图像标注并绑定拖拽标注结束后事件
    mk = new baiduMap.Marker(point, { enableDragging: true });
    mapObj.addOverlay(mk);
    mk.addEventListener('dragend', (e: any) => {
      getAddrByPoint(e.point);
    });

    // 3、添加（右上角）平移缩放控件
    mapObj.addControl(
      new baiduMap.NavigationControl({
        // @ts-ignore
        anchor: window.BMAP_ANCHOR_TOP_RIGHT,
        // @ts-ignore
        type: window.BMAP_NAVIGATION_CONTROL_SMALL,
      }),
    );

    // 4、添加（左下角）定位控件
    geolocationControl = new baiduMap.GeolocationControl({
      // @ts-ignore
      anchor: window.BMAP_ANCHOR_BOTTOM_LEFT,
    });
    geolocationControl.addEventListener('locationSuccess', (e: any) => {
      getAddrByPoint(e.point);
    });
    geolocationControl.addEventListener('locationError', (e: any) => {
      alert(e.message);
    });
    mapObj.addControl(geolocationControl);

    // 5、绑定点击地图任意点事件
    mapObj.addEventListener('click', (e: any) => {
      getAddrByPoint(e.point);
    });

    // 6、开启鼠标滚轮缩放
    mapObj.enableScrollWheelZoom(true);

    pSetPoint(props.lng, props.lat);

    loading.value = false;
  };

  // 逆地址解析函数
  const getAddrByPoint = (point: any) => {
    const geco = new baiduMap.Geocoder();
    geco.getLocation(point, (res: any) => {
      mk.setPosition(point);
      mapObj.panTo(point);

      emit('update:address', res.address);
      emit('update:lng', point.lng);
      emit('update:lat', point.lat);

      emit('change', {
        value: {
          address: res.address,
          lng: point.lng,
          lat: point.lat,
        },
      });
    });
  };

  const pSetPoint = (lng?: number, lat?: number) => {
    if (lng && lat) {
      const point = new baiduMap.Point(lng, lat);
      mk && mk.setPosition(point);
      mapObj && mapObj.panTo(point);
    }
  };

  let local: any = null;
  const pQuerySearchAsync = (str: string, cb: any) => {
    if (!local) {
      local = new baiduMap.LocalSearch(mapObj, {
        onSearchComplete: (res: any) => {
          const list = [];
          if (res) {
            const poiNum = res.getCurrentNumPois();
            for (let i = 0; i < poiNum; i++) {
              list.push(res.getPoi(i));
            }
          }
          cb(list);
        },
      });
    }
    local.search(str);
  };

  onMounted(() => {
    init();
  });

  /**
   * @zh 设置地图中心点
   * @public
   * @param lng
   * @param lat
   */
  function setPoint(lng?: number, lat?: number) {
    pSetPoint(lng, lat);
  }
  /**
   * @zh 搜索地址
   * @public
   * @param str
   * @param cb
   */
  function querySearchAsync(str: string, cb: any) {
    pQuerySearchAsync(str, cb);
  }

  defineExpose({
    setPoint,
    querySearchAsync,
  });
</script>

<style lang="less">
  @import './map';
</style>
../utils/useFramework
