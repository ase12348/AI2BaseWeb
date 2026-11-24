<div align="center">

# 极简搭 · AI 应用开发基座（Web）

**企业级低代码 / AI 应用开发平台 · PC 端前端**

版本 `3.3.0` · 社区版 · Apache-2.0

[官方网站](https://www.jcodesoft.com) · [后端服务](https://gitee.com/program_cat/ai2-base-api) · [移动端](https://gitee.com/program_cat/ai2-base-app)

</div>

---

## 项目简介

极简搭（jcode）AI 应用开发基座是一套面向企业应用的**开发平台**，而不是一个成品管理系统。它把「建表 → 配界面 → 定流程 → 发应用」这条链路上的重复工作沉淀为可视化配置，业务代码只在配置表达不了的地方才需要写。

本仓库是平台的 **Web 前端（PC 端）**，基于 Vue 3 + Vite + TypeScript 构建，负责平台自身的全部管理界面与运行时渲染。它不包含后端逻辑，所有数据能力由后端基座服务提供。

| 组成 | Gitee | GitHub | 技术栈 | 说明 |
| --- | --- | --- | --- | --- |
| Web 前端 | [AI2BaseWeb](https://gitee.com/program_cat/ai2-base-web) | [AI2BaseWeb](https://github.com/ase12348/AI2BaseWeb) | Vue 3 / Vite / TS | PC 端管理界面 |
| 后端服务 | [AI2BaseApi](https://gitee.com/program_cat/ai2-base-api) | [AI2BaseApi](https://github.com/ase12348/AI2BaseApi) | .NET 10 / ASP.NET Core | API 宿主、ORM、权限、缓存、任务调度 |
| 移动端 | [AI2BaseApp](https://gitee.com/program_cat/ai2-base-app) | [AI2BaseApp](https://github.com/ase12348/AI2BaseApp) | uni-app / Vue 3 | 同一套表单渲染到小程序 / App / 鸿蒙 |

> 官网与产品介绍：**<https://www.jcodesoft.com>**

---

## 功能特性

**数据建模** — 数据源（多库接入）、数据表、编码表、编码规则、数据项字典，建表即可生成 CRUD 界面与接口。

**组织与权限** — 公司 / 部门 / 岗位 / 角色 / 用户全套组织模型，应用与模块授权、数据权限、访问黑名单、在线用户管理，权限路由由后端菜单动态下发。

**系统能力** — 多语言（界面语言 + 业务数据多语言）、消息与 IM（SignalR 实时通信）、定时任务（Quartz）、登录 / 密码 / 短信策略配置、操作日志。

**通用组件库** — 表格（vxe-table）、图表、代码编辑器、文件上传与预览（Word / Excel / PPT / PDF）、条码、地图、统计动效等 60+ 业务组件，均为配置驱动。

---

## 技术栈

| 分类   | 选型                                                                 |
| ------ | -------------------------------------------------------------------- |
| 框架   | Vue 3.5、Vue Router 4、Pinia 2、TypeScript 5.5                       |
| 构建   | Vite 6、pnpm workspace、Turborepo、UnoCSS                            |
| UI     | Ant Design Vue、vxe-table / vxe-pc-ui、自研 JcodeUI 组件             |
| 通信   | Axios、Microsoft SignalR                                             |
| 国际化 | Vue I18n                                                             |
| 工程化 | ESLint、Prettier、Stylelint、Husky、lint-staged、commitlint + cz-git |

---

## 目录结构

```
AI2BaseWeb/
├── internal/                 # 内部工程配置包（@vben/*，pnpm workspace 成员）
│   ├── eslint-config/        # ESLint 规则
│   ├── stylelint-config/     # 样式规则
│   ├── ts-config/            # TS 基础配置
│   └── vite-config/          # Vite 统一构建配置与插件
├── src/
│   ├── config/               # 平台级配置：站点信息、主题、登录页、首页
│   │   ├── web.ts            # 标题、版本、公司、布局与缓存参数
│   │   ├── theme.ts          # 布局与外观默认值
│   │   └── themeColor.ts     # 主题色板
│   └── core/
│       ├── components/       # 通用组件（app / data / organization / system / ui / message / language）
│       │   └── ui/           # 60+ 基础组件：tablePanel、echarts、codeMirror…
│       ├── enums/            # 枚举常量
│       ├── hooks/            # 组合式函数：useAuth、useData、useForm、useMenu、usePage、useIm…
│       ├── layouts/          # 布局容器
│       ├── locales/          # 多语言文案
│       ├── logics/           # 全局逻辑（mitt 事件总线）
│       ├── modules/          # 业务模块
│       │   ├── data/         # 数据建模：数据源 / 数据表 / 编码表 / 编码规则 / 数据项
│       │   ├── system/       # 首页、日志、错误页、iframe、表单
│       │   ├── organization/ # 公司 / 部门 / 岗位 / 角色 / 用户 / 在线用户 / 黑名单
│       │   ├── permission/   # 应用与模块授权
│       │   ├── quartz/       # 定时任务
│       │   ├── message/      # 消息、消息策略、IM
│       │   ├── language/     # 多语言维护
│       │   ├── systemconfig/ # 登录 / 密码 / 短信策略
│       │   ├── excel/        # 导入导出
│       │   ├── login/        # 登录、个人中心
│       │   └── mapp/         # 移动端应用配置
│       ├── router/           # 路由与权限守卫
│       ├── store/            # Pinia 状态
│       ├── ui/design/        # 设计系统样式基座
│       └── utils/            # 工具函数
├── index.html                # 入口模板（含首屏加载动画）
├── vite.config.mts           # 应用构建入口
├── Dockerfile / nginx.conf   # 容器化部署
└── .env.*                    # 分环境配置
```

---

## 快速开始

### 环境要求

| 依赖    | 版本                                 |
| ------- | ------------------------------------ |
| Node.js | `>= 18.12.1`（推荐 18 LTS / 20 LTS） |
| pnpm    | `>= 9.0.6`                           |

> ⚠️ 本项目**只允许 pnpm**。`package.json` 的 `preinstall` 会执行 `only-allow pnpm`，使用 npm / yarn 安装会直接中断。

### 1. 安装依赖

```bash
pnpm install
```

首次安装会自动执行 `turbo run stub`（构建内部配置包）并通过 husky 安装 Git 钩子。

### 2. 配置后端接口地址

编辑 `.env.development`，将接口地址指向本地后端服务：

```ini
VITE_GLOB_API_URL = http://localhost:5050
```

### 3. 启动后端服务

前端依赖后端基座提供接口与菜单。请先拉取并启动 [AI2BaseApi](https://gitee.com/program_cat/ai2-base-api)：

```bash
dotnet build jcode.framework.sln
dotnet run --project jcode.webapi
```

后端默认以 SQLite 本地库启动（`wwwroot/database/jcode.db`），开箱即用；切换数据库只需修改 `appsettings.json` 中的 `ServerOp.dbType` 与 `ServerOp.dbConn`。

### 4. 启动前端

```bash
pnpm dev
```

默认监听 `0.0.0.0:5173`，浏览器访问 <http://localhost:5173>。

---

## 构建

| 命令                 | 说明                              | 读取配置          |
| -------------------- | --------------------------------- | ----------------- |
| `pnpm build`         | 生产构建                          | `.env.production` |
| `pnpm build:test`    | 测试环境构建（提高打包内存至 8G） | `.env.test`       |
| `pnpm build:docker`  | 容器镜像构建专用                  | `.env.docker`     |
| `pnpm build:desktop` | 桌面端构建，接口走同源相对路径    | `.env.desktop`    |
| `pnpm build:analyze` | 构建并生成产物体积分析            | `.env.analyze`    |

产物输出到 `dist/`。生产构建默认开启 gzip 压缩。

### 环境变量

| 变量 | 说明 | 示例 |
| --- | --- | --- |
| `VITE_GLOB_API_URL` | 后端接口基础地址 | `http://localhost:5050` |
| `VITE_GLOB_PATH` | 静态资源部署路径（子目录部署时修改） | `/` |
| `VITE_GLOB_APP_NAME` | 应用标识，用于本地缓存隔离 | `v3_jcode_prd` |
| `VITE_BUILD_COMPRESS` | 压缩方式：`gzip` / `brotli` / `none`，多个用 `,` 分隔 | `gzip` |

> 部署到自有环境时，请同步修改对应 `.env.*` 中的 `VITE_GLOB_API_URL`，否则前端仍会请求预置的演示接口。

---

## Docker 部署

```bash
# 构建镜像（内部执行 pnpm build:docker）
docker build -t ai2base-web .

# 启动容器
docker run -d -p 8080:80 --name ai2base-web ai2base-web
```

镜像采用 `node:18-alpine` 构建 + `nginx:1.23.3-alpine` 运行。`nginx.conf` 已处理两件事：

- `try_files $uri $uri/ /index.html` —— 支持 History 路由刷新不 404；
- 静态资源（js / css / 图片 / 字体）缓存 1 天。

> ⚠️ `.env.docker` 中的接口地址是 `http://localhost:5050`，容器内的 `localhost` 指向容器自身。正式部署前请改为真实后端地址，或将前后端置于同一域名下并使用 `/api` 相对路径。

---

## 开发规范

**提交信息** 遵循 [Conventional Commits](https://www.conventionalcommits.org/)，由 commitlint + cz-git 校验，`pre-commit` 钩子自动执行 lint-staged（ESLint / Prettier / Stylelint）：

```bash
pnpm commit          # 交互式生成规范提交信息
```

允许的类型：`feat` `fix` `perf` `style` `docs` `test` `refactor` `build` `ci` `chore` `revert` `wip` `workflow` `types` `release`。

**代码检查**

```bash
pnpm lint:eslint     # 检查并修复 src 下的 .vue / .ts / .tsx
pnpm lint:prettier   # 全仓库格式化
pnpm lint:stylelint  # 检查并修复样式
pnpm type:check      # TypeScript 类型检查
```

> 注意：`pnpm lint` 实际是 `turbo run lint`，只覆盖 `internal/*` 内部配置包，**不会**检查 `src/`。需要检查业务代码请用上面的 `pnpm lint:eslint`。

---

## 浏览器支持

现代浏览器最近两个版本，覆盖 Chrome / Edge / Firefox / Safari；不支持 IE 11。

---

## 社区交流

扫码加入 QQ 交流群，或添加微信联系作者（请注明来意）：

<table>
  <tr>
    <td align="center">
      <b>QQ 交流群 · 1132049639</b><br>
      <img src="docs/images/qq-group-qr.png" width="220" alt="QQ 交流群二维码">
    </td>
    <td align="center">
      <b>微信 · tobin</b><br>
      <img src="docs/images/wechat-qr.png" width="220" alt="微信二维码">
    </td>
  </tr>
</table>

---

## 许可证

本项目基于 [Apache License 2.0](LICENSE) 开源。

Copyright © 苏州极简搭信息技术有限公司

---

<div align="center">

更多产品信息与技术支持请访问 **[www.jcodesoft.com](https://www.jcodesoft.com)**

</div>
