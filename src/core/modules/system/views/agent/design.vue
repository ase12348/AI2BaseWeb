<template>
  <div class="l-agent-design">
    <!-- 顶部栏 -->
    <div class="l-agent-design-header">
      <div class="l-agent-design-header-left">
        <img v-if="logoImg" class="l-agent-design-logo" :src="logoImg" alt="logo" />
        <span class="l-agent-design-name" :title="entity.f_Name">{{ entity.f_Name }}</span>
        <a-dropdown :trigger="['click']">
          <span class="l-agent-design-version">
            <i
              class="l-agent-design-version-dot"
              :class="`is-status-${currentVersion?.f_Enabled}`"
            ></i>
            {{ currentVersion?.f_Name }}
            <lr-icon icon="ant-design:caret-down-filled" :size="10" />
          </span>
          <template #overlay>
            <div class="l-agent-design-version-menu">
              <div
                v-for="item in versions"
                :key="item.f_Id"
                class="l-agent-design-version-menu-item"
                @click="handleSwitchVersion(item.f_Id)"
              >
                <i
                  class="l-agent-design-version-menu-dot"
                  :class="`is-status-${item.f_Enabled}`"
                ></i>
                <span class="l-agent-design-version-menu-name">{{ item.f_Name }}</span>
                <span
                  class="l-agent-design-version-menu-tag"
                  :class="`is-status-${item.f_Enabled}`"
                >
                  {{ versionStatusMap[item.f_Enabled] }}
                </span>
                <span
                  class="l-agent-design-version-menu-del"
                  @click.stop="handleDeleteVersion(item)"
                >
                  <lr-icon
                    v-if="item.f_Enabled === 0"
                    icon="ant-design:delete-outlined"
                    :size="16"
                  />
                </span>
              </div>
              <div class="l-agent-design-version-menu-add" @click="handleAddVersion">
                <lr-icon icon="ant-design:plus-outlined" :size="14" />
                <span>{{ $t('新增智能体版本') }}</span>
              </div>
            </div>
          </template>
        </a-dropdown>
        <div v-if="currentVersion?.f_Enabled !== 0" class="l-agent-design-notice">
          <lr-icon
            icon="ant-design:exclamation-circle-filled"
            :size="16"
            class="l-agent-design-notice-icon"
          />
          <span>{{
            $t(
              `${currentVersion?.f_Enabled == 1 ? '启用中' : '已归档'}${t('的版本不可修改')}，${t('请')}`,
            )
          }}</span>
          <a class="l-agent-design-notice-link" @click="handleAddVersion">
            {{ $t('添加新版本') }}
          </a>
        </div>
      </div>
      <div class="l-agent-design-header-right">
        <span
          v-if="currentVersion?.f_Enabled === 0"
          class="l-agent-design-close is-primary"
          @click="handlePublishVersion"
        >
          {{ $t('发布') }}
        </span>
        <span
          v-if="currentVersion?.f_Enabled !== 1"
          class="l-agent-design-close is-primary"
          @click="handleEnableVersion"
        >
          {{ $t('启用') }}
        </span>
        <span class="l-agent-design-close" @click="handleClose">{{ $t('关闭') }}</span>
      </div>
    </div>

    <!-- 主体三栏 -->
    <div class="l-agent-design-body">
      <!-- 左：模型配置 + 角色设定 -->
      <div class="l-agent-design-panel l-agent-design-left">
        <div class="l-agent-design-row">
          <span class="l-agent-design-row-title">{{ $t('模型配置') }}</span>
          <span ref="modelBtnRef" class="l-agent-design-model-btn" @click="toggleModelPanel">
            {{ modelType }}
            <lr-icon icon="ant-design:swap-outlined" :size="14" />
          </span>
          <teleport to="body">
            <div
              v-if="modelPanelOpen"
              ref="modelPanelRef"
              class="l-agent-design-model-panel"
              :style="modelPanelStyle"
            >
              <div class="l-agent-design-model-panel-title">{{ $t('模型配置') }}</div>
              <div class="l-agent-design-model-panel-label">{{ $t('LLM模型') }}</div>
              <a-select
                v-model:value="modelType"
                class="l-agent-design-model-select"
                :options="modelOptions"
                :get-popup-container="getModelContainer"
                show-search
              />
              <div class="l-agent-design-model-panel-head">
                <span class="l-agent-design-model-panel-title">{{ $t('模型参数') }}</span>
                <span
                  class="l-agent-design-model-reset"
                  :title="$t('重置参数')"
                  @click="resetModelParams"
                >
                  <lr-icon icon="ant-design:reload-outlined" :size="16" />
                </span>
              </div>
              <a-divider class="l-agent-design-model-panel-divider" />
              <div
                v-for="meta in modelParamMetas"
                :key="meta.key"
                class="l-agent-design-model-param"
              >
                <div class="l-agent-design-model-param-label">
                  {{ $t(meta.label) }}
                  <a-tooltip :title="$t(meta.tip)">
                    <lr-icon
                      icon="ant-design:question-circle-filled"
                      :size="16"
                      class="l-agent-design-model-param-tip"
                    />
                  </a-tooltip>
                </div>
                <div class="l-agent-design-model-param-row">
                  <a-slider
                    v-model:value="modelParams[meta.key]"
                    :min="meta.min"
                    :max="meta.max"
                    :step="meta.step"
                  />
                  <a-input-number
                    v-model:value="modelParams[meta.key]"
                    :min="meta.min"
                    :max="meta.max"
                    :step="meta.step"
                  />
                </div>
              </div>
            </div>
          </teleport>
        </div>
        <a-divider class="l-agent-design-divider" />
        <div class="l-agent-design-row">
          <span class="l-agent-design-row-title">{{ $t('角色设定') }}</span>
          <div class="l-agent-design-tools">
            <span
              class="l-agent-design-tool"
              :title="$t('提交到提示词库')"
              @click="handleSubmitToLib"
            >
              <lr-icon icon="ant-design:cloud-upload-outlined" :size="16" />
            </span>
            <span class="l-agent-design-tool" :title="$t('提示词模板')" @click="handleTemplate">
              <lr-icon icon="ant-design:inbox-outlined" :size="16" />
            </span>
            <span class="l-agent-design-tool" :title="$t('优化建议')" @click="handleTip">
              <lr-icon icon="ant-design:bulb-outlined" :size="16" />
            </span>
            <span class="l-agent-design-tool" :title="$t('智能优化')" @click="handleOptimize">
              <lr-icon icon="ant-design:thunderbolt-outlined" :size="16" />
            </span>
          </div>
        </div>
        <textarea
          v-model="rolePrompt"
          class="l-agent-design-editor"
          :placeholder="$t('请输入角色设定')"
        ></textarea>
      </div>

      <!-- 中：对话体验 / 知识 / 技能 -->
      <div class="l-agent-design-panel l-agent-design-mid">
        <div class="l-agent-design-tabs">
          <span
            v-for="tab in tabs"
            :key="tab.key"
            :class="['l-agent-design-tab', { 'is-active': tab.key === activeTab }]"
            @click="activeTab = tab.key"
          >
            {{ $t(tab.label) }}
          </span>
        </div>
        <div v-show="activeTab === 'experience'" class="l-agent-design-sections">
          <div v-for="sec in sections" :key="sec.key" class="l-agent-design-section">
            <div class="l-agent-design-section-head" @click="sec.open = !sec.open">
              <lr-icon
                icon="ant-design:right-outlined"
                :size="12"
                :class="['l-agent-design-section-arrow', { 'is-open': sec.open }]"
              />
              <span class="l-agent-design-section-title">{{ $t(sec.label) }}</span>
              <span class="l-agent-design-section-extra">
                <span v-if="sec.key === 'quick'" class="l-agent-design-add" @click.stop="addQuick">
                  <lr-icon icon="ant-design:plus-outlined" :size="12" />
                  {{ $t('添加') }}
                </span>
                <span v-else-if="sec.key === 'recommend'" @click.stop>
                  <a-switch v-model:checked="config.recommendEnabled" />
                </span>
              </span>
            </div>
            <!-- v-if：保证 lr-input-rows 挂载时分区可见，避免 Sortable 在隐藏容器初始化失效 -->
            <div
              v-if="sec.open"
              :class="[
                'l-agent-design-section-body',
                { 'is-flat': sec.key === 'recommend' || sec.key === 'other' },
              ]"
            >
              <template v-if="sec.key === 'opening'">
                <div class="l-agent-design-field-label">{{ $t('开场白文案') }}</div>
                <a-textarea
                  v-model:value="config.opening"
                  :placeholder="$t('请输入')"
                  :auto-size="{ minRows: 4, maxRows: 8 }"
                />
                <div class="l-agent-design-field-head">
                  <span class="l-agent-design-field-label">{{ $t('开场白预置问题') }}</span>
                </div>
                <lr-input-rows v-model:value="config.presets" :columns="presetColumns" is-compact />
              </template>
              <template v-else-if="sec.key === 'quick'">
                <lr-input-rows
                  v-model:value="config.quicks"
                  :columns="quickColumns"
                  :is-add-btn="false"
                />
                <div v-if="config.quicks.length === 0" class="l-agent-design-placeholder">
                  {{ $t('暂无快捷指令，点击右上角添加') }}
                </div>
              </template>
              <template v-else-if="sec.key === 'recommend'">
                <div class="l-agent-design-recommend-desc">
                  {{
                    config.recommendEnabled
                      ? $t('在智能体回复后，根据 Prompt 提供最多 3 条用户提问建议')
                      : $t('在每次智能体回复后，不会提供任何用户问题建议')
                  }}
                </div>
                <template v-if="config.recommendEnabled">
                  <a-checkbox
                    v-model:checked="config.recommendCustom"
                    class="l-agent-design-recommend-custom"
                  >
                    {{ $t('用户自定义Prompt') }}
                  </a-checkbox>
                  <a-textarea
                    v-if="config.recommendCustom"
                    v-model:value="config.recommendPrompt"
                    :auto-size="{ minRows: 4, maxRows: 8 }"
                  />
                </template>
              </template>
              <template v-else-if="sec.key === 'background'">
                <lr-input-img v-model="config.backgroundImg" />
              </template>
              <template v-else>
                <div class="l-agent-design-switch-row">
                  <span>{{ $t('全网检索') }}</span>
                  <a-switch v-model:checked="config.searchEnabled" />
                </div>
                <div class="l-agent-design-switch-row">
                  <span>{{ $t('上传图片') }}</span>
                  <a-switch v-model:checked="config.imgEnabled" />
                </div>
                <div class="l-agent-design-switch-row">
                  <span>{{ $t('上传附件') }}</span>
                  <a-switch v-model:checked="config.fileEnabled" />
                </div>
              </template>
            </div>
          </div>
        </div>
        <div v-show="activeTab === 'knowledge'" class="l-agent-design-sections">
          <div v-for="sec in knowledgeSections" :key="sec.key" class="l-agent-design-section">
            <div class="l-agent-design-section-head" @click="sec.open = !sec.open">
              <lr-icon
                icon="ant-design:right-outlined"
                :size="12"
                :class="['l-agent-design-section-arrow', { 'is-open': sec.open }]"
              />
              <span class="l-agent-design-section-title">{{ $t(sec.label) }}</span>
              <span class="l-agent-design-section-extra">
                <span
                  v-if="sec.key === 'related'"
                  class="l-agent-design-add"
                  @click.stop="addKnowledge"
                >
                  <lr-icon icon="ant-design:plus-outlined" :size="12" />
                  {{ $t('添加') }}
                </span>
              </span>
            </div>
            <div v-if="sec.open" class="l-agent-design-section-body is-flat">
              <template v-if="sec.key === 'related'">
                <div class="l-agent-design-list-desc">
                  {{
                    $t(
                      '将文档或表格上传为知识库后，用户发送消息时，应用能够引用知识库中的内容回答用户问题',
                    )
                  }}
                </div>
                <div
                  v-for="(kb, index) in config.knowledgeBases"
                  :key="kb.f_Id"
                  class="l-agent-design-list-item"
                >
                  <span
                    class="l-agent-design-list-item-icon"
                    :style="{ background: knowledgeColor }"
                  >
                    <lr-icon :icon="kb.f_Icon" :size="26" />
                  </span>
                  <span class="l-agent-design-list-item-body">
                    <span class="l-agent-design-list-item-name">{{ kb.f_Name }}</span>
                    <span class="l-agent-design-list-item-desc">{{ kb.f_Description }}</span>
                  </span>
                  <span class="l-agent-design-list-item-acts">
                    <span
                      class="l-agent-design-list-item-act is-del"
                      :title="$t('移除')"
                      @click="removeKnowledge(index)"
                    >
                      <lr-icon icon="ant-design:delete-outlined" :size="16" />
                    </span>
                  </span>
                </div>
              </template>
              <template v-else>
                <div class="l-agent-design-knowledge-group">{{ $t('召回') }}</div>
                <div class="l-agent-design-knowledge-field">
                  <div class="l-agent-design-knowledge-field-row">
                    <span class="l-agent-design-knowledge-field-label">{{ $t('调用方式') }}</span>
                    <a-radio-group v-model:value="config.recallMode">
                      <a-radio :value="1">{{ $t('强制调用') }}</a-radio>
                      <a-radio :value="2">{{ $t('按需调用') }}</a-radio>
                    </a-radio-group>
                  </div>
                  <div class="l-agent-design-knowledge-field-desc">
                    {{
                      config.recallMode === 1
                        ? $t('每次对话都先查找知识库进行回答')
                        : $t('根据情况判断是否查找知识库')
                    }}
                  </div>
                </div>
                <div v-if="config.recallMode === 2" class="l-agent-design-knowledge-field">
                  <div class="l-agent-design-knowledge-field-row">
                    <span class="l-agent-design-knowledge-field-label is-required">
                      {{ $t('判断规则') }}
                    </span>
                    <a-tooltip
                      :title="
                        $t(
                          '例如：该知识包含了员工差旅规则的详细内容，当咨询的问题是关于员工差旅规则时，应该在该知识库中查找内容。',
                        )
                      "
                    >
                      <span class="l-agent-design-knowledge-example">{{ $t('示例') }}</span>
                    </a-tooltip>
                  </div>
                  <a-textarea
                    v-model:value="config.recallRule"
                    :placeholder="$t('请输入调用知识库的详细场景描述')"
                    :auto-size="{ minRows: 5, maxRows: 8 }"
                  />
                </div>
                <div class="l-agent-design-knowledge-field">
                  <div class="l-agent-design-knowledge-field-row">
                    <span class="l-agent-design-knowledge-field-label">
                      {{ $t('最大召回数量') }}
                    </span>
                    <span class="l-agent-design-knowledge-slider">
                      <a-slider v-model:value="config.recallCount" :min="1" :max="10" :step="1" />
                      <a-input-number
                        v-model:value="config.recallCount"
                        :min="1"
                        :max="10"
                        :step="1"
                      />
                    </span>
                  </div>
                  <div class="l-agent-design-knowledge-field-desc">
                    {{
                      $t(
                        '从各个知识库中匹配到的结果中，按与问题的匹配度，从大到小依次排列并返回前 N 个结果',
                      )
                    }}
                  </div>
                </div>
                <div class="l-agent-design-knowledge-field">
                  <div class="l-agent-design-knowledge-field-row">
                    <span class="l-agent-design-knowledge-field-label">
                      {{ $t('最小匹配度') }}
                    </span>
                    <span class="l-agent-design-knowledge-slider">
                      <a-slider v-model:value="config.recallScore" :min="0" :max="1" :step="0.1" />
                      <a-input-number
                        v-model:value="config.recallScore"
                        :min="0"
                        :max="1"
                        :step="0.1"
                      />
                    </span>
                  </div>
                  <div class="l-agent-design-knowledge-field-desc">
                    {{
                      $t(
                        '从各个知识库中匹配到的结果中，筛选出匹配度高于要求的结果，低于匹配度的结果会被筛除',
                      )
                    }}
                  </div>
                </div>
                <a-divider class="l-agent-design-knowledge-divider" />
                <div class="l-agent-design-knowledge-group">{{ $t('回复') }}</div>
                <div class="l-agent-design-knowledge-field">
                  <div class="l-agent-design-knowledge-field-row">
                    <span class="l-agent-design-knowledge-field-label">
                      {{ $t('无召回回复') }}
                      <a-tooltip :title="$t('未从知识库中召回相关内容时，将使用以下内容回复用户')">
                        <lr-icon
                          icon="ant-design:question-circle-filled"
                          :size="16"
                          class="l-agent-design-knowledge-tip"
                        />
                      </a-tooltip>
                    </span>
                    <a-radio-group v-model:value="config.noRecallType" @change="handleNoRecallType">
                      <a-radio :value="1">{{ $t('默认') }}</a-radio>
                      <a-radio :value="2">{{ $t('自定义') }}</a-radio>
                    </a-radio-group>
                  </div>
                  <a-textarea
                    v-model:value="config.noRecallText"
                    :disabled="config.noRecallType === 1"
                    :maxlength="500"
                    :auto-size="{ minRows: 3, maxRows: 5 }"
                    show-count
                  />
                </div>
              </template>
            </div>
          </div>
        </div>
        <div v-show="activeTab === 'skill'" class="l-agent-design-sections">
          <div v-for="sec in skillSections" :key="sec.key" class="l-agent-design-section">
            <div class="l-agent-design-section-head" @click="sec.open = !sec.open">
              <lr-icon
                icon="ant-design:right-outlined"
                :size="12"
                :class="['l-agent-design-section-arrow', { 'is-open': sec.open }]"
              />
              <span class="l-agent-design-section-title">{{ $t(sec.label) }}</span>
              <span class="l-agent-design-section-extra">
                <span class="l-agent-design-add" @click.stop="addSkillItem(sec.key)">
                  <lr-icon icon="ant-design:plus-outlined" :size="12" />
                  {{ $t('添加') }}
                </span>
              </span>
            </div>
            <div v-if="sec.open" class="l-agent-design-section-body is-flat">
              <div class="l-agent-design-list-desc">{{ $t(skillMetaMap[sec.key].desc) }}</div>
              <div
                v-for="(item, index) in config[skillMetaMap[sec.key].list]"
                :key="item.f_Id"
                class="l-agent-design-list-item"
              >
                <span
                  class="l-agent-design-list-item-icon"
                  :style="{ background: skillMetaMap[sec.key].color }"
                >
                  <lr-icon :icon="item.f_Icon" :size="26" />
                </span>
                <span class="l-agent-design-list-item-body">
                  <span class="l-agent-design-list-item-name">{{ item.f_Name }}</span>
                  <span class="l-agent-design-list-item-desc">{{ item.f_Description }}</span>
                </span>
                <span class="l-agent-design-list-item-acts">
                  <span
                    class="l-agent-design-list-item-act"
                    :title="$t('详情')"
                    @click="handleItemDetail(item, skillMetaMap[sec.key].color)"
                  >
                    <lr-icon icon="ant-design:file-search-outlined" :size="16" />
                  </span>
                  <span
                    class="l-agent-design-list-item-act is-del"
                    :title="$t('移除')"
                    @click="removeSkillItem(sec.key, index)"
                  >
                    <lr-icon icon="ant-design:delete-outlined" :size="16" />
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右：预览与调试 -->
      <div class="l-agent-design-panel l-agent-design-right">
        <div class="l-agent-design-row">
          <span class="l-agent-design-row-title">{{ $t('预览与调试') }}</span>
          <span class="l-agent-design-tool is-plain" :title="$t('清空对话')" @click="clearChat">
            <lr-icon icon="ant-design:delete-outlined" :size="16" />
          </span>
        </div>
        <div class="l-agent-design-alert">
          <lr-icon
            icon="ant-design:exclamation-circle-filled"
            :size="16"
            class="l-agent-design-alert-icon"
          />
          <span>{{ $t('配置完成后请先保存，预览调试才能生效') }}</span>
        </div>
        <div class="l-agent-design-preview-body" :style="previewBgStyle">
          <div ref="chatRef" class="l-agent-design-chat">
            <div class="l-agent-design-chat-line">
              <span class="l-agent-design-chat-avatar">
                <lr-icon icon="ant-design:robot-filled" :size="18" />
              </span>
              <span class="l-agent-design-chat-bubble">Hi</span>
            </div>
            <div class="l-agent-design-chat-welcome">{{ welcomeText }}</div>
            <div
              v-for="(msg, i) in messages"
              :key="i"
              :class="['l-agent-design-chat-line', `is-${msg.role}`]"
            >
              <span v-if="msg.role === 'ai'" class="l-agent-design-chat-avatar">
                <lr-icon icon="ant-design:robot-filled" :size="18" />
              </span>
              <div :class="['l-agent-design-chat-col', `is-${msg.role}`]">
                <span :class="['l-agent-design-chat-msg', `is-${msg.role}`]">
                  <span>{{ msg.text }}</span>
                  <div v-if="msg.files && msg.files.length" class="l-agent-design-chat-files">
                    <template v-for="(f, fi) in msg.files" :key="fi">
                      <img v-if="f.isImage" :src="f.url" class="l-agent-design-chat-file-img" />
                      <span v-else class="l-agent-design-chat-file">
                        <lr-icon icon="ant-design:paper-clip-outlined" :size="12" />
                        {{ f.name }}
                      </span>
                    </template>
                  </div>
                </span>
                <lr-upload
                  v-if="msg.img"
                  :value="msg.img"
                  is-upload-img
                  :limit="-1"
                  onlyShowList
                  :listIconSize="16"
                  readonly
                />
                <lr-upload
                  v-if="msg.file"
                  :value="msg.file"
                  :limit="-1"
                  onlyShowList
                  :listIconSize="16"
                  readonly
                />
              </div>
              <a-avatar
                v-if="msg.role === 'user'"
                class="l-agent-design-chat-avatar is-user"
                :style="{ 'background-color': themeToken?.jcode_colorAvatarHeader }"
                :size="32"
                :src="userAvatar"
              >
                {{ userAvatarName.toUpperCase() }}
              </a-avatar>
            </div>
          </div>
          <div v-if="config.quicks.length" class="l-agent-design-quick-chips">
            <span
              v-for="item in config.quicks"
              :key="item.f_Id"
              class="l-agent-design-quick-chip"
              :title="item.f_Content"
              @click="handleQuickSend(item)"
            >
              <lr-icon :icon="item.f_Icon || 'ant-design:global-outlined'" :size="16" />
              <span>{{ item.f_Name }}</span>
            </span>
          </div>
          <lr-upload
            v-model:value="question.img"
            is-upload-img
            :limit="-1"
            onlyShowList
            :listIconSize="16"
          />
          <lr-upload v-model:value="question.file" :limit="-1" onlyShowList :listIconSize="16" />
          <div class="l-agent-design-input">
            <a-textarea
              v-model:value="question.text"
              :placeholder="$t('请输入问题描述')"
              :auto-size="{ minRows: 3, maxRows: 5 }"
              :bordered="false"
              @press-enter="handleEnter"
              @paste="handlePaste"
            />
            <div class="l-agent-design-input-actions">
              <span
                v-if="config.searchEnabled"
                :class="['l-agent-design-search-chip', { 'is-active': config.searchActive }]"
                @click="config.searchActive = !config.searchActive"
              >
                <lr-icon icon="ant-design:global-outlined" :size="16" />
                <span>{{ $t('全网检索') }}</span>
              </span>
              <span class="l-agent-design-input-acts">
                <lr-upload
                  v-if="config.imgEnabled"
                  :showFileList="false"
                  onlyIcon
                  v-model:value="question.img"
                  is-upload-img
                  icon="ant-design:picture-outlined"
                  :limit="-1"
                />
                <lr-upload
                  v-if="config.fileEnabled"
                  :showFileList="false"
                  onlyIcon
                  v-model:value="question.file"
                  icon="ant-design:paper-clip-outlined"
                  :limit="-1"
                />
                <span
                  class="l-agent-design-input-send"
                  :class="{ 'is-disabled': !canSend }"
                  :title="$t('发送')"
                  @click="sendQuestion"
                >
                  <lr-icon icon="ant-design:telegram-filled" :size="18" />
                </span>
              </span>
            </div>
          </div>
          <div class="l-agent-design-foot">{{ $t('内容由AI生成，仅供参考') }}</div>
        </div>
      </div>
    </div>

    <prompt-template v-model:visible="templateVisible" @insert="handleInsertPrompt" />

    <!-- 技能条目详情弹窗（只读，无底部按钮） -->
    <lr-modal
      v-model:visible="detailVisible"
      :title="$t('详情')"
      :width="560"
      :height="320"
      :hasBtns="false"
    >
      <div> </div>
    </lr-modal>

    <lr-dynamic-layer ref="layerRef" />
  </div>
</template>
<script lang="ts" setup>
  import { computed, h, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
  import { api, type agentEntity, type agentVersionEntity } from './data';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useUserStore } from '/@/core/store/organization/user';
  import { useGlobSetting } from '/@/core/hooks/setting';
  import PromptTemplate from './template.vue';
  import PromptForm from './promptForm.vue';
  import QuickForm from './quickForm.vue';
  import { t } from '@/core/locales/setupI18n';

  const props = defineProps<{ entity: agentEntity }>();
  const emit = defineEmits(['close']);

  const { success, info, createConfirm } = useMessage();
  const provide = inject('jcode_app_provide', {} as Record<string, any>);
  const { logoImg, themeToken } = provide;
  const userStore = useUserStore();
  const { apiUrl } = useGlobSetting();

  // 预览区背景图样式
  const previewBgStyle = computed(() => {
    if (!config.backgroundImg) return {};
    return {
      backgroundImage: `url(${apiUrl}/system/annexesfile/${config.backgroundImg}?token=${userStore.getToken})`,
    };
  });

  // 版本管理：启用中的版本不可修改
  const versions = ref<agentVersionEntity[]>([]);
  const currentVersionId = ref('');
  const currentVersion = computed(
    () => versions.value.find((item) => item.f_Id === currentVersionId.value) || versions.value[0],
  );
  // 根据智能体主键请求版本数据
  const loadVersions = async () => {
    versions.value = await api.getVersions(props.entity.f_Id);
    if (!versions.value.some((item) => item.f_Id === currentVersionId.value)) {
      currentVersionId.value = versions.value[0]?.f_Id || '';
    }
  };
  onMounted(loadVersions);
  // 版本状态：0设计中 1启用中 2已归档
  const versionStatusMap: Record<number, string> = {
    0: t('设计中'),
    1: t('启用中'),
    2: t('已归档'),
  };
  const handleSwitchVersion = (id: string) => {
    currentVersionId.value = id;
  };
  const handleAddVersion = () => {
    const id = `v${Date.now()}`;
    versions.value.push({
      f_Id: id,
      f_Name: `${t('智能体版本')}V${versions.value.length + 1}`,
      f_Enabled: 0,
    });
    currentVersionId.value = id;
    success(t('新版本创建成功'));
  };
  // 删除版本（仅设计中的版本可删除）
  const handleDeleteVersion = (item: agentVersionEntity) => {
    if (item.f_Enabled !== 0) return;
    createConfirm({
      title: t('提示'),
      iconType: 'warning',
      content: `${t('您确定删除')}【${item.f_Name}】${t('吗')}`,
      onOk: async () => {
        versions.value = versions.value.filter((v) => v.f_Id !== item.f_Id);
        if (currentVersionId.value === item.f_Id) {
          currentVersionId.value = versions.value[0]?.f_Id || '';
        }
        success(t('删除成功'));
      },
    });
  };
  // 发布版本（仅设计中）
  const handlePublishVersion = async () => {
    // TODO: 接入后替换为：await api.publishVersion(props.entity.f_Id, currentVersionId.value);
    success(t('发布成功'));
  };
  // 启用版本：当前版本启用，原启用中的版本归档
  const handleEnableVersion = () => {
    versions.value.forEach((v) => {
      if (v.f_Id === currentVersionId.value) {
        v.f_Enabled = 1;
      } else if (v.f_Enabled === 1) {
        v.f_Enabled = 2;
      }
    });
    success(t('启用成功'));
  };

  // 模型配置：LLM 模型分组候选与模型参数
  const modelOptions = [
    {
      label: t('阿里云百炼'),
      options: [{ value: t('对话模型') }, { value: t('推理模型') }, { value: t('多模态模型') }],
    },
  ];
  const modelType = ref(t('对话模型'));
  interface modelParamMeta {
    key: 'temperature' | 'topP' | 'context' | 'maxTokens';
    label: string;
    tip: string;
    min: number;
    max: number;
    step: number;
  }
  const modelParamMetas: modelParamMeta[] = [
    {
      key: 'temperature',
      label: t('模型温度'),
      tip: `${t('模型生成文本的随机程度')}。${t('值越低')}，${t('回答越严谨')}。${t('值越高')}，${t('回答越发散')}。${t('设置为0根据事实回答')}，${t('日常聊天建议设置为')}0.7`,
      min: 0,
      max: 1,
      step: 0.1,
    },
    {
      key: 'topP',
      label: `top-p ${t('采样')}`,
      tip: `${t('默认值为')}1，${t('值越小')}，AI${t('生成的内容越单调也容易理解')}，${t('值越大')}，AI${t('内容词汇范围越大')}，${t('越多样化')}`,
      min: 0,
      max: 1,
      step: 0.1,
    },
    {
      key: 'context',
      label: t('上下文数量'),
      tip: `${t('提示词中携带的历史聊天记录轮次')}。${t('值越大')}，${t('消耗的')}Token${t('越多')}。${t('设置为0则不携带聊天记录')}，${t('普通聊天建议')}5-10`,
      min: 1,
      max: 50,
      step: 1,
    },
    {
      key: 'maxTokens',
      label: `${t('最大')}Token${t('数')}`,
      tip: `${t('问题')}+${t('答案的最大')}token${t('数')}，${t('会影响返回的长度')}，${t('如果出现回答被截断')}，${t('可调高此值')}`,
      min: 1024,
      max: 8192,
      step: 1024,
    },
  ];
  const defaultModelParams = { temperature: 0.7, topP: 1, context: 10, maxTokens: 1024 };
  const modelParams = reactive({ ...defaultModelParams });
  const resetModelParams = () => {
    Object.assign(modelParams, defaultModelParams);
  };
  // 模型配置面板：手动控制显隐，面板内操作不收起
  const modelPanelOpen = ref(false);
  const modelPanelRef = ref<HTMLElement>();
  const modelBtnRef = ref<HTMLElement>();
  const modelPanelStyle = ref<Record<string, string>>({});
  const toggleModelPanel = () => {
    if (!modelPanelOpen.value) {
      const rect = modelBtnRef.value?.getBoundingClientRect();
      if (rect) {
        const left = Math.max(12, Math.min(rect.left, window.innerWidth - 372));
        modelPanelStyle.value = { top: `${rect.bottom + 8}px`, left: `${left}px` };
      }
    }
    modelPanelOpen.value = !modelPanelOpen.value;
  };
  // LLM 模型下拉渲染到面板内，避免其点击被误判为面板外部点击
  const getModelContainer = (node: HTMLElement) =>
    (node.closest('.l-agent-design-model-panel') as HTMLElement) || document.body;
  // 记录 mousedown 是否起始于面板/按钮内（如滑块拖拽到面板外释放不应收起）
  let modelDownInside = false;
  const handleModelMouseDown = (e: MouseEvent) => {
    const target = e.target as Node;
    modelDownInside =
      !!modelPanelRef.value?.contains(target) || !!modelBtnRef.value?.contains(target);
  };
  const handleModelDocClick = (e: MouseEvent) => {
    const target = e.target as Node;
    if (
      modelBtnRef.value?.contains(target) ||
      modelDownInside ||
      modelPanelRef.value?.contains(target)
    ) {
      return;
    }
    modelPanelOpen.value = false;
  };
  onMounted(() => {
    document.addEventListener('mousedown', handleModelMouseDown);
    document.addEventListener('click', handleModelDocClick);
  });
  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleModelMouseDown);
    document.removeEventListener('click', handleModelDocClick);
  });

  // 角色设定提示词
  const buildPrompt = (name: string) =>
    `你是${name}，一个智能AI助手。\n\n## 核心定位\n- 知识渊博，逻辑清晰，善于用通俗语言解释复杂概念\n- 主动追问模糊需求，避免无效回答\n- 根据场景调整语气（正式/轻松/鼓励/严谨）\n\n## 能力边界\n- 擅长：信息查询、分析推理、创意生成、文书辅助、编程指导\n- 不确定时明确告知，不编造信息\n\n## 沟通风格\n- 结构化输出，善用分点、加粗、引用\n- 先给结论/摘要，再展开细节\n- 复杂问题提供多角度视角\n\n## 交互原则\n- 响应前先思考用户真实意图\n- 遇歧义主动澄清，不做假设\n- 每次回答附1-2个跟进问题引导深入`;
  const rolePrompt = ref(buildPrompt(props.entity.f_Name));

  const templateVisible = ref(false);
  const handleTemplate = () => {
    templateVisible.value = true;
  };
  const handleInsertPrompt = (content: string) => {
    rolePrompt.value = content;
    success(t('已插入提示词'));
  };

  const layerRef = ref();
  const handleSubmitToLib = () => {
    layerRef.value.open({
      title: t('新建提示词'),
      name: h(PromptForm),
      width: 620,
      height: 600,
      btnText: t('确定'),
      param: { content: rolePrompt.value },
    });
  };
  const handleTip = () => {
    info(`${t('优化建议')}：${t('补充能力边界与输出格式约束')}，${t('可显著提升回答质量')}`);
  };
  const handleOptimize = () => {
    info(t('智能优化功能待接入'));
  };

  // 中部页签与配置分区
  const tabs = [
    { key: 'experience', label: t('对话体验') },
    { key: 'knowledge', label: t('知识') },
    { key: 'skill', label: t('技能') },
  ];
  const activeTab = ref('experience');

  const sections = reactive([
    { key: 'opening', label: t('开场白'), open: true },
    { key: 'quick', label: t('快捷指令'), open: false },
    { key: 'recommend', label: t('问题推荐'), open: false },
    { key: 'background', label: t('背景图片'), open: false },
    { key: 'other', label: t('其他配置'), open: false },
  ]);
  // 知识页签分区：关联知识库与知识库配置
  const knowledgeSections = reactive([
    { key: 'related', label: t('关联知识库'), open: true },
    { key: 'setting', label: t('知识库配置'), open: true },
  ]);
  // 技能页签分区：工具管理、MCP服务、Skills服务
  const skillSections = reactive([
    { key: 'tool', label: t('工具管理'), open: true },
    { key: 'mcp', label: `MCP${t('服务')}`, open: true },
    { key: 'skills', label: `Skills${t('服务')}`, open: true },
  ]);
  // 技能分区元数据：列表字段、Mock 名称、图标、卡片底色与说明文案
  const skillMetaMap: Record<
    string,
    {
      list: 'tools' | 'mcps' | 'skills';
      name: string;
      icon: string;
      color: string;
      desc: string;
      mockDesc: string;
    }
  > = {
    tool: {
      list: 'tools',
      name: t('生成流程'),
      icon: 'ant-design:tool-filled',
      color: 'linear-gradient(135deg, #b678f7 0%, #8338ec 100%)',
      desc: `${t('添加工具来增强能力')}，${t('大模型会根据你的输入和描述')}，${t('智能调用工具')}`,
      mockDesc: t('创建完整流程'),
    },
    mcp: {
      list: 'mcps',
      name: t('数据查询服务'),
      icon: 'ant-design:api-filled',
      color: 'linear-gradient(135deg, #b678f7 0%, #8338ec 100%)',
      desc: `${t('添加')}MCP${t('来增强能力')}，${t('大模型会根据你的输入和描述')}，${t('智能调用')}MCP`,
      mockDesc: `${t('通过')}MCP${t('协议连接外部数据源与工具服务')}`,
    },
    skills: {
      list: 'skills',
      name: t('打招呼'),
      icon: 'ant-design:tool-filled',
      color: 'linear-gradient(135deg, #b678f7 0%, #8338ec 100%)',
      desc: `${t('添加')}Skills${t('来增强能力')}，${t('大模型会根据你的输入和描述')}，${t('智能调用')}Skills`,
      mockDesc: `${t('提供友好的问候')}，${t('并介绍')} AI ${t('助手的功能')}。${t('当用户开启对话时自动发送问候语')}`,
    },
  };
  // 快捷指令实体（i 为 lr-input-rows 内部注入的行主键）
  interface quickEntity {
    f_Id: string;
    i?: string;
    f_Icon: string;
    f_Name: string;
    f_Content: string;
  }
  // 开场白预置问题实体（i 为 lr-input-rows 内部注入的行主键）
  interface presetEntity {
    i?: string;
    f_Content: string;
  }
  // 关联知识库实体
  interface knowledgeEntity {
    f_Id: string;
    f_Icon: string;
    f_Name: string;
    f_Description: string;
  }
  // 技能条目实体（工具/MCP/Skills 三类列表共用）
  interface skillItemEntity {
    f_Id: string;
    f_Icon: string;
    f_Name: string;
    f_Description: string;
  }
  // 关联知识库卡片图标与底色
  const knowledgeIcon = 'ant-design:file-text-filled';
  const knowledgeColor = 'linear-gradient(135deg, #40a9ff 0%, #1677ff 100%)';
  // 问题推荐：用户自定义 Prompt 默认内容
  const defaultRecommendPrompt = [
    '- 问题应该与你最后一轮的回复紧密相关，可以引发进一步的讨论。',
    '- 问题不要与上文已经提问或者回答过的内容重复。',
    '- 每句话只包含一个问题，但也可以不是问句而是一句指令。',
    '- 推荐你有能力回答的问题。',
  ].join('\n');
  // 无召回回复：默认回复文案
  const defaultNoRecallText = `${t('抱歉')}，${t('您的问题超出了我的知识范围')}，${t('并且无法在当前阶段回答')}`;
  const config = reactive({
    opening: '',
    presets: [] as presetEntity[],
    quicks: [] as quickEntity[],
    recommendEnabled: false,
    recommendCustom: true,
    recommendPrompt: defaultRecommendPrompt,
    backgroundImg: '',
    searchEnabled: false,
    searchActive: false,
    imgEnabled: true,
    fileEnabled: true,
    knowledgeBases: [] as knowledgeEntity[],
    // 召回调用方式：1强制调用 2按需调用
    recallMode: 1,
    recallRule: '',
    recallCount: 5,
    recallScore: 0.4,
    // 无召回回复类型：1默认 2自定义
    noRecallType: 1,
    noRecallText: defaultNoRecallText,
    tools: [] as skillItemEntity[],
    mcps: [] as skillItemEntity[],
    skills: [] as skillItemEntity[],
  });
  // 添加关联知识库（Mock 追加，接入后替换为知识库选择弹窗）
  const addKnowledge = () => {
    config.knowledgeBases.push({
      f_Id: `kb_${Date.now()}`,
      f_Icon: knowledgeIcon,
      f_Name: t('极简搭知识库'),
      f_Description: `${t('管理员')}/admin`,
    });
  };
  const removeKnowledge = (index: number) => {
    config.knowledgeBases.splice(index, 1);
  };
  // 无召回回复切回默认时恢复默认文案
  const handleNoRecallType = (e: { target: { value: number } }) => {
    if (e.target.value === 1) {
      config.noRecallText = defaultNoRecallText;
    }
  };
  // 添加技能条目（Mock 追加，接入后替换为对应资源选择弹窗）
  const addSkillItem = (key: string) => {
    const meta = skillMetaMap[key];
    config[meta.list].push({
      f_Id: `${key}_${Date.now()}`,
      f_Icon: meta.icon,
      f_Name: meta.name,
      f_Description: meta.mockDesc,
    });
  };
  const removeSkillItem = (key: string, index: number) => {
    config[skillMetaMap[key].list].splice(index, 1);
  };
  // 技能条目详情弹窗（知识库不提供详情）
  const detailVisible = ref(false);
  const detailItem = ref<skillItemEntity>();
  const detailColor = ref('');
  const handleItemDetail = (item: skillItemEntity, color: string) => {
    detailItem.value = item;
    detailColor.value = color;
    detailVisible.value = true;
  };
  // 新建快捷指令：打开表单弹窗，保存后追加到列表
  const addQuick = () => {
    layerRef.value.open({
      title: t('新建'),
      name: h(QuickForm),
      width: 620,
      height: 560,
      btnText: t('确定'),
      param: {
        onSubmit: (data: quickEntity) => {
          config.quicks.push({
            f_Id: `quick_${Date.now()}`,
            f_Icon: data.f_Icon || '',
            f_Name: data.f_Name,
            f_Content: data.f_Content,
          });
        },
      },
    });
  };

  // 编辑快捷指令：打开表单弹窗并回填当前行，保存后按索引更新图标、名称、内容
  const editQuick = (index: number, row: quickEntity) => {
    layerRef.value.open({
      title: t('编辑'),
      name: h(QuickForm),
      width: 620,
      height: 560,
      btnText: t('确定'),
      param: {
        data: {
          main: {
            f_Icon: row.f_Icon,
            f_Name: row.f_Name,
            f_Content: row.f_Content,
          },
        },
        onSubmit: (data: quickEntity) => {
          config.quicks[index] = {
            ...config.quicks[index],
            f_Icon: data.f_Icon || '',
            f_Name: data.f_Name,
            f_Content: data.f_Content,
          };
        },
      },
    });
  };

  const quickColumns = [
    {
      prop: 'f_Icon',
      inputType: 'lr-input-icon',
      config: { defaultValue: 'star-outlined', onlyButton: true, width: 28 },
    },
    {
      prop: 'f_Name',
      inputType: 'input',
      config: { placeholder: '指令名称' },
    },
    {
      // 编辑列：lr-button 类型，经 getUpConfig 注入行级 onClick 打开表单弹窗回填修改
      prop: 'f_Edit',
      inputType: 'lr-button',
      width: 40,
      config: {
        type: 'text',
        iconName: 'ant-design:edit-outlined',
        notLabel: true,
        getUpConfig: ({ index, row }: { index: number; row: quickEntity }) => ({
          onClick: () => editQuick(index, row),
        }),
      },
    },
  ];

  const presetColumns = [
    {
      prop: 'f_Content',
      inputType: 'input',
      config: { placeholder: '输入预设问题' },
    },
  ];

  // 预览与调试（Mock 对话）
  const welcomeText = computed(
    () =>
      `${t('我是')}${props.entity.f_Name}，${t('简搭')}AI${t('智能助手')}，${t('有什么能帮助到您的吗')}`,
  );
  // 附件实体（预览阶段本地持有，接入后替换为上传接口返回的文件Id）
  interface attachmentEntity {
    name: string;
    isImage: boolean;
    url: string;
    file: File;
  }
  const messages = ref<
    { role: 'user' | 'ai'; text: string; files?: attachmentEntity[]; img?: string; file?: string }[]
  >([]);
  const question = ref({ text: '', img: '', file: '' });
  const chatRef = ref();

  // 当前登录者头像（无头像时显示账号前两位大写，同顶部栏用户头像）
  const userAvatar = computed(() =>
    userStore.getLoginInfo.avatar
      ? `${apiUrl}/system/annexesfile/${userStore.getLoginInfo.avatar}?token=${userStore.getToken}`
      : '',
  );
  const userAvatarName = computed(() => {
    const account = userStore.getLoginInfo.account || '';
    return account.length > 2 ? account.slice(0, 2) : account;
  });

  // 待发送附件列表
  const attachments = ref<attachmentEntity[]>([]);
  // 有文本才可发送
  const canSend = computed(() => !!question.value.text.trim());
  // a-upload 拦截：仅存入列表，不自动上传
  const handleBeforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    attachments.value.push({
      name: file.name,
      isImage,
      url: isImage ? URL.createObjectURL(file) : '',
      file,
    });
    return false;
  };
  // 粘贴剪贴板中的图片/文件到附件（对应上传能力开启时才接收）
  const handlePaste = (e: ClipboardEvent) => {
    Array.from(e.clipboardData?.files || []).forEach((f) => {
      const enabled = f.type.startsWith('image/') ? config.imgEnabled : config.fileEnabled;
      if (enabled) {
        handleBeforeUpload(f);
      }
    });
  };

  const scrollBottom = () => {
    const el = chatRef.value;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };
  const handleEnter = (e: KeyboardEvent) => {
    if (e.shiftKey) {
      return;
    }
    e.preventDefault();
    sendQuestion();
  };
  // 发送问题（携带附件，Mock 回复）
  const sendQuestion = () => {
    const text = question.value.text.trim();
    const { img, file } = question.value;
    if (!text) {
      return;
    }
    messages.value.push({ role: 'user', text, files: [...attachments.value], img, file });
    question.value = { text: '', img: '', file: '' };
    attachments.value = [];
    setTimeout(() => {
      messages.value.push({
        role: 'ai',
        text: `${t('已收到您的问题')}：“${text || `[${t('附件')}]`}”。当前为预览模式，保存配置后即可体验完整回答。`,
      });
      nextTick(scrollBottom);
    }, 300);
    nextTick(scrollBottom);
  };
  // 点击快捷指令：将指令内容直接发送给智能体
  const handleQuickSend = (item: quickEntity) => {
    question.value.text = item.f_Content;
    sendQuestion();
  };
  const clearChat = () => {
    messages.value = [];
    attachments.value = [];
    question.value = { text: '', img: '', file: '' };
  };

  const handleClose = () => {
    emit('close');
  };
</script>

<style lang="less">
  .l-agent-design {
    display: flex;
    position: fixed;
    z-index: 1000;
    flex-direction: column;
    background: radial-gradient(700px 320px at 10% -80px, rgb(255 158 188 / 40%), transparent 65%),
      radial-gradient(600px 300px at 72% -60px, rgb(125 205 255 / 45%), transparent 65%),
      linear-gradient(180deg, #c9d6f2 0%, #d6def4 45%, #e9edf6 100%);
    inset: 0;

    &-header {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      height: 56px;
      padding: 0 16px;

      &-left {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }

      &-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }

    &-logo {
      height: 28px;
    }

    &-name {
      max-width: 240px;
      overflow: hidden;
      color: #1f1f1f;
      font-size: 16px;
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &-version {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #1f1f1f;
      font-size: 14px;
      cursor: pointer;

      &-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;

        &.is-status-0 {
          background: #faad14;
        }

        &.is-status-1 {
          background: #52c41a;
        }

        &.is-status-2 {
          background: #9aa5b1;
        }
      }

      &-menu {
        min-width: 260px;
        padding: 8px;
        border-radius: 8px;
        background: #f5f7fa;
        box-shadow: 0 6px 16px rgb(0 0 0 / 12%);

        &-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 12px;
          border-radius: 6px;
          cursor: pointer;

          &:hover {
            background: #e9edf2;

            .l-agent-design-version-menu-del {
              visibility: visible;
              color: var(--color-error, #1677ff);
            }
          }
        }

        &-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;

          &.is-status-0 {
            background: #faad14;
          }

          &.is-status-1 {
            background: #52c41a;
          }

          &.is-status-2 {
            background: #9aa5b1;
          }
        }

        &-name {
          flex: 1;
          color: #1f2329;
        }

        &-tag {
          padding: 2px 14px;
          border-radius: 14px;
          color: #fff;

          &.is-status-0 {
            background: #faad14;
          }

          &.is-status-1 {
            background: #52c41a;
          }

          &.is-status-2 {
            background: #9aa5b1;
          }
        }

        &-del {
          display: inline-flex;
          visibility: hidden;
          align-items: center;
          justify-content: center;
          width: 16px;
          color: #5f6672;
        }

        &-add {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 8px;
          padding: 12px 0;
          border-top: 1px solid #e5e8ec;
          color: var(--color-primary, #1677ff);
          font-size: 15px;
          cursor: pointer;
        }
      }
    }

    &-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 18px;
      background: #fff;
      box-shadow: 0 2px 8px rgb(31 35 48 / 8%);
      font-size: 13px;

      &-icon {
        color: #faad14;
      }

      &-link {
        color: var(--color-primary, #1677ff);
        cursor: pointer;
      }
    }

    &-close {
      padding: 6px 16px;
      border-radius: 16px;
      background: #fff;
      box-shadow: 0 2px 8px rgb(31 35 48 / 8%);
      color: #1f1f1f;
      font-size: 14px;
      cursor: pointer;

      &:hover {
        color: var(--color-primary, #1677ff);
      }

      &.is-primary {
        background: var(--color-primary, #1677ff);
        color: #fff;

        &:hover {
          opacity: 0.85;
          color: #fff;
        }
      }
    }

    &-body {
      display: flex;
      flex: 1;
      gap: 12px;
      min-height: 0;
      padding: 0 12px 12px;
    }

    &-panel {
      display: flex;
      flex-direction: column;
      min-height: 0;
      padding: 8px 16px 16px;
      overflow: hidden;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 2px 10px rgb(31 35 48 / 4%);
    }

    &-left {
      flex: 0 0 35%;
    }

    &-mid {
      flex: 0 0 36%;
      padding: 0;
    }

    &-right {
      flex: 1;
      min-width: 0;

      .lr-upload-imgItem {
        width: 60px;
        height: 60px;
      }
    }

    &-row {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      height: 44px;

      &-title {
        color: #1f1f1f;
        font-size: 15px;
        font-weight: 600;
      }
    }

    &-divider {
      margin: 0;
    }

    &-model-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      transition: all 0.2s ease;
      border: 1px solid var(--color-border, #d9d9d9);
      border-radius: 6px;
      background: #fafafa;
      color: #1f1f1f;
      font-size: 13px;
      cursor: pointer;

      &:hover {
        border-color: var(--color-primary, #1677ff);
        color: var(--color-primary, #1677ff);
      }
    }

    &-model-panel {
      position: fixed;
      z-index: 1050;
      width: 360px;
      max-height: calc(100vh - 96px);
      padding: 20px;
      overflow-y: auto;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 6px 16px rgb(0 0 0 / 12%);

      &-title {
        color: #1f1f1f;
        font-size: 16px;
        font-weight: 700;
      }

      &-label {
        margin: 16px 0 8px;
        color: #1f1f1f;
        font-size: 14px;
      }

      &-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 20px;
      }

      &-divider {
        margin: 12px 0 4px;
      }
    }

    &-model-select {
      width: 100%;
    }

    &-model-reset {
      display: inline-flex;
      align-items: center;
      color: #595959;
      cursor: pointer;

      &:hover {
        color: var(--color-primary, #1677ff);
      }
    }

    &-model-param {
      padding: 8px 0;

      &-label {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
        color: #1f1f1f;
        font-size: 14px;
      }

      &-tip {
        color: #8c8c8c;
        cursor: pointer;
      }

      &-row {
        display: flex;
        align-items: center;
        gap: 16px;

        .ant-slider {
          flex: 1;
          margin: 0;
        }

        .ant-input-number {
          width: 96px;
        }
      }
    }

    &-tools {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &-tool {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      transition: all 0.2s ease;
      border-radius: 6px;
      background: #f2f4f7;
      color: #595959;
      cursor: pointer;

      &:hover {
        background: var(--color-primary-bg, #e6f4ff);
        color: var(--color-primary, #1677ff);
      }

      &.is-plain {
        background: transparent;
      }
    }

    &-editor {
      flex: 1;
      min-height: 0;
      margin-top: 4px;
      padding: 12px;
      transition: border-color 0.2s ease;
      border: 1px solid var(--color-border, #d9d9d9);
      border-radius: 8px;
      outline: none;
      background: transparent;
      color: #1f1f1f;
      font-family: inherit;
      font-size: 14px;
      line-height: 24px;
      resize: none;

      &:focus {
        border-color: var(--color-primary, #1677ff);
      }
    }

    &-tabs {
      display: flex;
      flex-shrink: 0;
      gap: 28px;
      padding: 0 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    &-tab {
      position: relative;
      padding: 14px 2px;
      color: #595959;
      font-size: 14px;
      cursor: pointer;

      &.is-active {
        color: var(--color-primary, #1677ff);
        font-weight: 500;

        &::after {
          content: '';
          position: absolute;
          right: 0;
          bottom: -1px;
          left: 0;
          height: 2px;
          border-radius: 1px;
          background: var(--color-primary, #1677ff);
        }
      }
    }

    &-sections {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }

    &-section {
      border-bottom: 1px solid #f0f0f0;

      &-head {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 14px 16px;
        cursor: pointer;
      }

      &-arrow {
        transition: transform 0.2s ease;
        color: #8c8c8c;

        &.is-open {
          transform: rotate(90deg);
        }
      }

      &-title {
        color: #1f1f1f;
        font-size: 14px;
      }

      &-extra {
        display: flex;
        align-items: center;
        margin-left: auto;
      }

      &-body {
        padding: 0 16px 16px 36px;

        &.is-flat {
          padding-left: 16px;
        }
      }
    }

    &-recommend-desc {
      margin-bottom: 16px;
      color: #8c8c8c;
      font-size: 14px;
      line-height: 22px;
    }

    &-recommend-custom {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      color: #1f1f1f;
      font-size: 14px;
    }

    &-add {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--color-primary, #1677ff);
      font-size: 13px;
      cursor: pointer;
    }

    &-field-label {
      margin-bottom: 8px;
      color: #1f1f1f;
      font-size: 14px;
    }

    &-field-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 16px;

      .l-agent-design-field-label {
        margin-bottom: 0;
      }
    }

    &-placeholder {
      padding: 18px 0;
      border: 1px dashed var(--color-border, #d9d9d9);
      border-radius: 8px;
      color: #bfbfbf;
      font-size: 13px;
      text-align: center;
      cursor: pointer;
    }

    &-switch-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0;
      color: #1f1f1f;
      font-size: 14px;
    }

    &-list-desc {
      margin-bottom: 8px;
      color: #8c8c8c;
      font-size: 14px;
      line-height: 22px;
    }

    &-list-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      padding: 12px;
      border-radius: 8px;
      background: #e9edf2;

      &:hover {
        .l-agent-design-list-item-acts {
          visibility: visible;
        }
      }

      &-icon {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 10px;
        color: #fff;
      }

      &-body {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
      }

      &-name {
        overflow: hidden;
        color: #1f1f1f;
        font-size: 15px;
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &-desc {
        overflow: hidden;
        color: #8c8c8c;
        font-size: 13px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &-acts {
        display: flex;
        visibility: hidden;
        flex-shrink: 0;
        align-items: center;
        gap: 14px;
      }

      &-act {
        display: inline-flex;
        align-items: center;
        color: #5f6672;
        cursor: pointer;

        &:hover {
          color: var(--color-primary, #1677ff);
        }

        &.is-del:hover {
          color: var(--color-error, #ff4d4f);
        }
      }
    }

    &-knowledge-group {
      margin: 4px 0 16px;
      color: #1f1f1f;
      font-size: 15px;
      font-weight: 600;
    }

    &-knowledge-field {
      margin-bottom: 20px;

      &-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      &-label {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        gap: 6px;
        color: #1f1f1f;
        font-size: 14px;

        &.is-required::before {
          content: '*';
          margin-right: 2px;
          color: var(--color-error, #ff4d4f);
        }
      }

      &-desc {
        margin-top: 6px;
        color: #8c8c8c;
        font-size: 13px;
        line-height: 20px;
      }
    }

    &-knowledge-slider {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 58%;

      .ant-slider {
        flex: 1;
        margin: 0;
      }

      .ant-input-number {
        width: 96px;
      }
    }

    &-knowledge-example {
      color: var(--color-primary, #1677ff);
      font-size: 13px;
      cursor: pointer;
    }

    &-knowledge-tip {
      color: #8c8c8c;
      cursor: pointer;
    }

    &-knowledge-divider {
      margin: 4px 0 16px;
    }

    &-empty {
      padding: 60px 0;
    }

    &-alert {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      gap: 8px;
      margin: 4px 0 12px;
      padding: 8px 12px;
      border-radius: 6px;
      background: #fffbe6;
      color: #1f1f1f;
      font-size: 13px;

      &-icon {
        flex-shrink: 0;
        color: #faad14;
      }
    }

    &-preview-body {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      padding: 10px 0;
      border-radius: 8px;
      background-color: var(--component-background);
      background-repeat: no-repeat;
      background-position: 50%;
      background-size: cover;
    }

    &-chat {
      flex: 1;
      min-height: 0;
      padding-right: 8px;
      overflow-y: auto;

      &-line {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 12px;

        &.is-user {
          justify-content: flex-end;

          .lr-upload-item {
            min-width: 110px;
          }
        }
      }

      &-avatar {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: #262a36;
        color: #ff4d4f;

        &.is-user {
          color: #fff;
          font-size: 12px;
        }
      }

      &-bubble {
        padding: 6px 14px;
        border-radius: 10px;
        background: #1f1f1f;
        color: #fff;
        font-size: 14px;
        font-weight: 600;
      }

      &-welcome {
        margin: 4px 0 16px;
        color: #1f1f1f;
        font-size: 15px;
        font-weight: 700;
      }

      &-col {
        display: flex;
        flex-direction: column;
        min-width: 0;
        max-width: 80%;
        gap: 4px;

        &.is-user {
          align-items: flex-end;
        }
      }

      &-msg {
        width: 100%;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 13px;
        line-height: 20px;
        word-break: break-all;
        white-space: pre-wrap;

        &.is-user {
          background: var(--color-primary, #1677ff);
          color: #fff;
        }

        &.is-ai {
          background: #f2f4f7;
          color: #1f1f1f;
        }

        .l-agent-design-chat-files {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 6px;
        }

        .l-agent-design-chat-file-img {
          width: 72px;
          height: 72px;
          border-radius: 6px;
          object-fit: cover;
        }

        .l-agent-design-chat-file {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 4px;
          background: rgb(255 255 255 / 25%);
          font-size: 12px;
        }
      }
    }

    &-quick-chips {
      display: flex;
      flex-shrink: 0;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 8px;
    }

    &-quick-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 10px;
      border-radius: 8px;
      background: #e9edf2;
      color: #1f2329;
      font-size: 12px;
      cursor: pointer;

      &:hover {
        background: #dfe4ea;
      }
    }

    &-input {
      position: relative;
      flex-shrink: 0;
      margin-top: 12px;
      border: 1px solid var(--color-border, #d9d9d9);
      border-radius: 8px;
      background: #fff;

      textarea {
        padding: 8px 12px 40px;
        box-shadow: none;
      }

      &-actions {
        display: flex;
        position: absolute;
        right: 12px;
        bottom: 8px;
        left: 12px;
        align-items: center;
      }

      &-acts {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-left: auto;
      }

      &-act {
        display: inline-flex;
        align-items: center;
        color: #8c8c8c;
        cursor: pointer;

        &:hover {
          color: var(--color-primary, #1677ff);
        }
      }

      &-send {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        color: var(--color-primary);
        cursor: pointer;

        &:hover {
          opacity: 0.85;
        }

        &.is-disabled {
          opacity: 0.4;
          color: #8c8c8c;
          cursor: not-allowed;

          &:hover {
            opacity: 0.4;
          }
        }
      }
    }

    &-search-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 2px 4px;
      border-radius: 18px;
      background: #f2f4f7;
      color: #1f2329;
      font-size: 12px;
      cursor: pointer;

      &.is-active {
        background: var(--color-primary-bg, #e6f4ff);
        color: var(--color-primary, #1677ff);
      }
    }

    &-foot {
      flex-shrink: 0;
      padding-top: 8px;
      color: #8c8c8c;
      font-size: 12px;
      text-align: center;
    }
  }
</style>
