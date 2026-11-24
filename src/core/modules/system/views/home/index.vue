<template>
  <div class="lr-block l-home-page">
    <a-row :gutter="8">
      <a-col :span="6">
        <div class="l-target-item">
          <div
            class="l-target-item-content"
            :style="`background-image: url(${urlPrefix}img/home/target.png);`"
          >
            <div class="l-target-icon">
              <lr-icon
                icon="ant-design:form-outlined"
                :is-div="false"
                :size="36"
                class="l-target-icon-i"
              />
            </div>
            <div class="l-target-des">
              <span class="l-target-des-num">300</span>
              <span class="l-target-des-text">{{ $t('最新商机量') }}</span>
            </div>
          </div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="l-target-item">
          <div
            class="l-target-item-content"
            :style="`background-image: url(${urlPrefix}img/home/target.png);`"
          >
            <div class="l-target-icon">
              <lr-icon
                icon="ant-design:user-outlined"
                :is-div="false"
                :size="36"
                class="l-target-icon-i"
              />
            </div>
            <div class="l-target-des">
              <span class="l-target-des-num">100</span>
              <span class="l-target-des-text">{{ $t('最新客户量') }}</span>
            </div>
          </div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="l-target-item">
          <div
            class="l-target-item-content"
            :style="`background-image: url(${urlPrefix}img/home/target.png);`"
          >
            <div class="l-target-icon">
              <lr-icon
                icon="ant-design:file-done-outlined"
                :is-div="false"
                :size="36"
                class="l-target-icon-i"
              />
            </div>
            <div class="l-target-des">
              <span class="l-target-des-num">200</span>
              <span class="l-target-des-text">{{ $t('新签订单量') }}</span>
            </div>
          </div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="l-target-item">
          <div
            class="l-target-item-content"
            :style="`background-image: url(${urlPrefix}img/home/target.png);`"
          >
            <div class="l-target-icon">
              <lr-icon
                icon="ant-design:money-collect-outlined"
                :is-div="false"
                :size="36"
                class="l-target-icon-i"
              />
            </div>
            <div class="l-target-des">
              <span class="l-target-des-num">3000000</span>
              <span class="l-target-des-text">{{ $t('销售额') }}</span>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
    <a-row :gutter="8">
      <a-col :span="24">
        <div class="l-chart-item">
          <div class="l-chart-item-content">
            <lr-panel :title="$t('订单数据')" style="padding: 0">
              <lr-echarts :option="option" />
            </lr-panel>
          </div>
        </div>
      </a-col>
    </a-row>
    <a-row :gutter="8">
      <a-col :span="12">
        <div class="l-list-item">
          <div class="l-list-item-content">
            <lr-panel :title="$t('新闻列表')" style="padding: 0">
              <div class="lr-block" style="padding: 8px 24px">
                <div class="lr-msg-line">
                  <a class="lr-msg-line-a" href="#"
                    >{{ $t('[新闻]') }}&nbsp;&nbsp;&nbsp;{{ $t('极简搭AI开发底座社区版本发布') }}</a
                  >
                  <label class="lr-msg-line-label">2020-11-01</label>
                </div>
                <div class="lr-msg-line">
                  <a class="lr-msg-line-a" href="#"
                    >{{ $t('[新闻]') }}&nbsp;&nbsp;&nbsp;{{ $t('极简搭AI开发底座java版本发布') }}</a
                  >
                  <label class="lr-msg-line-label">2020-05-01</label>
                </div>
                <div class="lr-msg-line">
                  <a class="lr-msg-line-a" href="#"
                    >{{ $t('[新闻]') }}&nbsp;&nbsp;&nbsp;{{ $t('极简搭AI开发底座最新更新') }}</a
                  >
                  <label class="lr-msg-line-label">2020-04-01</label>
                </div>
                <div class="lr-msg-line">
                  <a class="lr-msg-line-a" href="#"
                    >{{ $t('[新闻]') }}&nbsp;&nbsp;&nbsp;{{ $t('极简搭集成新的报表插件') }}</a
                  >
                  <label class="lr-msg-line-label">2020-03-01</label>
                </div>
                <div class="lr-msg-line">
                  <a class="lr-msg-line-a" href="#"
                    >{{ $t('[新闻]') }}&nbsp;&nbsp;&nbsp;{{ $t('极简搭成立新的研发团队') }}</a
                  >
                  <label class="lr-msg-line-label">2020-02-01</label>
                </div>
              </div>
            </lr-panel>
          </div>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="l-list-item">
          <div class="l-list-item-content">
            <lr-panel :title="$t('通知公告')" style="padding: 0">
              <div class="lr-block" style="padding: 8px 24px">
                <div class="lr-msg-line">
                  <a class="lr-msg-line-a" href="#"
                    >{{ $t('[公告]') }}&nbsp;&nbsp;&nbsp;{{ $t('国庆节放假安排') }}</a
                  >
                  <label class="lr-msg-line-label">2020-06-01</label>
                </div>
                <div class="lr-msg-line">
                  <a class="lr-msg-line-a" href="#"
                    >{{ $t('[通知]') }}&nbsp;&nbsp;&nbsp;{{ $t('苏州分公司总经理任命书') }}</a
                  >
                  <label class="lr-msg-line-label">2020-05-21</label>
                </div>
                <div class="lr-msg-line">
                  <a class="lr-msg-line-a" href="#"
                    >{{ $t('[通知]') }}&nbsp;&nbsp;&nbsp;{{ $t('公司开票信息更新通知') }}</a
                  >
                  <label class="lr-msg-line-label">2020-04-21</label>
                </div>
                <div class="lr-msg-line">
                  <a class="lr-msg-line-a" href="#"
                    >{{ $t('[公告]') }}&nbsp;&nbsp;&nbsp;{{ $t('全体员工体验通知') }}</a
                  >
                  <label class="lr-msg-line-label">2020-03-01</label>
                </div>
                <div class="lr-msg-line">
                  <a class="lr-msg-line-a" href="#"
                    >{{ $t('[通知]') }}&nbsp;&nbsp;&nbsp;{{ $t('华东区营销总监任命书') }}</a
                  >
                  <label class="lr-msg-line-label">2020-02-01</label>
                </div>
              </div>
            </lr-panel>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
  import { useGlobSetting } from '/@/core/hooks/setting';
  import { reactive } from 'vue';

  const { urlPrefix } = useGlobSetting();
  const option = reactive({
    color: ['#409EFF'],
    legend: {
      padding: 0,
    },
    grid: {
      left: 64,
      right: 48,
      top: 48,
      bottom: 48,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLine: {
        show: false,
        lineStyle: {
          color: '#999',
        },
      },
    },
    yAxis: {
      axisLine: {
        show: false,
        lineStyle: {
          color: 'transparent',
        },
      },
      axisLabel: {
        color: '#999',
      },
      splitLine: {
        lineStyle: {
          color: '#d7dae2',
        },
      },
      type: 'value',
    },
    series: [
      {
        data: [300, 932, 901, 934, 1290, 2000, 800],
        type: 'line',
        areaStyle: {
          color: '#ecf5ff',
        },
        smooth: true,
      },
    ],
  });
</script>

<style lang="less">
  .l-home-page {
    padding: 0 8px 8px;
    overflow-y: auto;

    .l-target-item,
    .l-chart-item,
    .l-list-item {
      position: relative;
      box-sizing: border-box;
      width: 100%;
      height: 152px;
      padding-top: 8px;

      &-content {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        background-color: #fff;
        background-position: 50%;
        background-size: cover;
      }
    }

    .l-chart-item {
      height: 400px;
    }

    .l-list-item {
      height: 272px;
    }

    .l-target-item-content {
      padding: 32px 24px;
    }

    .l-target-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 88px;
      height: 88px;
      border-radius: 50%;
      text-align: center;

      &-i {
        font-size: 32px;
      }
    }

    .ant-col:nth-child(4n + 1) .l-target-icon-i {
      color: #67c23a;
    }

    .ant-col:nth-child(4n + 2) .l-target-icon-i {
      color: #409eff;
    }

    .ant-col:nth-child(4n + 3) .l-target-icon-i {
      color: #e6a23c;
    }

    .ant-col:nth-child(4n + 4) .l-target-icon-i {
      color: #f56c6c;
    }

    .ant-col:nth-child(4n + 1) .l-target-icon {
      background-color: #e1f3d7;
    }

    .ant-col:nth-child(4n + 2) .l-target-icon {
      background-color: #ecf5ff;
    }

    .ant-col:nth-child(4n + 3) .l-target-icon {
      background-color: #faecd8;
    }

    .ant-col:nth-child(4n + 4) .l-target-icon {
      background-color: #fde2e2;
    }

    .l-target-des {
      position: absolute;
      top: 32px;
      left: 136px;

      &-num {
        display: block;
        font-size: 20px;
        font-weight: 600;
      }

      &-text {
        display: block;
        margin-top: 4px;
        color: #666;
        font-size: 14px;
      }
    }

    .lr-msg-line {
      position: relative;
      width: 100%;
      border-bottom: 1px solid #ccc;
      line-height: 38px;

      &-a {
        color: #333;
        font-size: 14px;
        text-decoration: none;
        cursor: pointer;
      }

      &-label {
        position: absolute;
        top: 0;
        right: 0;
        margin-bottom: 0;
        color: #333;
        font-size: 14px;
        font-weight: 400;
      }
    }
  }
</style>
