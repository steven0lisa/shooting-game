# Mega Weapon Pack 调研：CC0 枪械模型盘点（步枪/手枪可用清单）

> 调研日期 2026-11-13，主仓 HEAD `fa552ad`（main）。目标：为武器库扩充盘点
> [3dassets.dev/packs/mega-weapon-pack](https://3dassets.dev/packs/mega-weapon-pack)（173 个 GLB、CC0）。
> 结论：**长枪（步枪+卡宾+冲锋枪+狙击/DMR）共 49 个、手枪 15 个**，另有霰弹枪 9 个备选；
> 分发为逐文件 CDN 直链 + JSON manifest（无整包 zip），单文件 0.55~3.26 MB，全部带刚体动画（换弹/拉栓等）。

## 1. 获取清单（分发方式）

- **JSON manifest（推荐，机器可读）**：`https://3dassets.dev/api/v1/packs/mega-weapon-pack`
  （GET 即返回，无需登录/token，`application/json`，约 880 KB；页面 "JSON manifest" 链接即指向它）。
  结构：`data.assets[]` 共 173 条，每条含 `title / summary / description / category / cdnUrl / downloadUrl /
  thumbnailUrl / posterUrl / stats{fileSize, triangles, animations, sizeMeters, boundingBox} / license / usage(three.js 示例代码)`。
- **逐文件 CDN 直链**：`https://cdn.3dassets.dev/assets/<id>/v1/model.glb`（CORS 开、内容永久、可硬缓存，
  页面 FAQ 明说可直接进 GLTFLoader 生产用）；缩略图同路径 `…/v1/thumb.webp`、海报 `…/v1/poster.webp`。
- **整包 zip：没有**。只有 "starter scene"（军械库房间，id 33460，488k 三角，把所有件摆成一间房），对游戏无用。
- 另有 MCP server 与 `https://3dassets.dev/skill.md` 的 agent 接入说明（本次未用，curl 已够）。
- 单资产页 `https://3dassets.dev/assets/<slug>`，`downloadUrl` 为 `https://3dassets.dev/download/<slug>`（人点按钮用的，agent 用 cdnUrl 即可）。

## 2. 分类筛选结果（数量结论）

173 个 = 枪械/近战/投掷/配件/道具/场景混合。按游戏需求（长枪+手枪两类）筛选：

| 类别 | 数量 | 合计体积 | 单文件范围 | 平均三角面 | 处置 |
|---|---|---|---|---|---|
| 手枪（含左轮） | **15** | 11.3 MB | 0.55~1.25 MB | 32.4k | 副武器池 |
| 冲锋枪/PDW | **11** | 12.5 MB | 0.82~1.49 MB | 44.2k | 主武器池 |
| 步枪/卡宾 | **20** | 26.8 MB | 0.89~2.17 MB | 48.9k | 主武器池 |
| 狙击/精确射手 | **18** | 31.7 MB | 1.22~3.26 MB | 63.2k | 主武器池 |
| **长枪小计** | **49** | 72.9 MB | — | — | — |
| 霰弹枪 | 9 | 10.0 MB | 0.78~1.66 MB | 40.9k | **备选**（数量可观，可单列） |
| 机枪 | 7 | — | — | — | 排除 |
| 发射器/榴弹 | 6 | — | — | — | 排除 |
| 信号枪 Flare Pistol | 1 | — | — | — | 排除（非战斗手枪） |

其余 86 个为投掷物（10）、瞄具/枪口/握把/枪托/弹匣等配件（40）、近战武器（22）、道具/场景（14），均不在本次范围。
注意：其中不少"配件"（瞄准镜、消音器、弹匣）与主武器是**分件**的，且同一把枪有"裸枪"与"Loadout/Fitted/Scoped"
（已装配件）两个版本——**游戏里建议选裸枪版**，配件自己挂（08-weapons 已有瞄具系统），避免重复。

## 3. 可用清单（表格）

CDN 直链前缀一律 `https://cdn.3dassets.dev/assets`，下表省略；后缀一律 `/v1/model.glb`。

**手枪（副武器） — 15 个，合计 11.3 MB**

| 模型名 | 大小 | 三角面 | 动画 | CDN 直链（`v1/model.glb`） | 造型备注 |
|---|---|---|---|---|---|
| Break Top Revolver | 0.62 MB | 27.3k | cock、spin | `…/assets/33299/v1/model.glb` | A top break revolver whose barrel and cylinder group hinge down at the standing breech, with a latch over th… |
| Compact Pistol | 0.64 MB | 27.7k | slide-open、slide-close、magazine-open、magazine-close、cock | `…/assets/33290/v1/model.glb` | A compact dark earth polymer framed self loading pistol for concealed carry, with a slide cut optic plate, a… |
| Compact Pistol, Carry Loadout | 0.90 MB | 37.9k | slide-open、slide-close、magazine-open、magazine-close、cock | `…/assets/33458/v1/model.glb` | The compact pistol with a miniature reflex sight in the slide cut and a compact laser on the short dust cove… |
| Long Slide Pistol | 0.72 MB | 32.4k | slide-open、slide-close、magazine-open、magazine-close、cock | `…/assets/33293/v1/model.glb` | A long slide self loading pistol with a ported compensator cut through the slide roof, a threaded muzzle and… |
| Long Slide Pistol, Suppressed | 1.15 MB | 49.0k | slide-open、slide-close、magazine-open、magazine-close、cock | `…/assets/33456/v1/model.glb` | The long slide pistol with a pistol suppressor on its threaded muzzle, a reflex sight in the slide cut and a… |
| Machine Pistol | 0.83 MB | 33.4k | slide-open、slide-close、magazine-open、magazine-close、cock | `…/assets/33294/v1/model.glb` | A selective fire machine pistol with a fore grip under the dust cover, an extended thirty round magazine and… |
| Machine Pistol, Fitted | 1.25 MB | 50.0k | slide-open、slide-close、magazine-open、magazine-close、cock | `…/assets/33457/v1/model.glb` | The machine pistol with a reflex sight in the slide cut, a suppressor on the muzzle and a light on the dust … |
| Magnum Revolver | 0.62 MB | 27.2k | cock、spin | `…/assets/33297/v1/model.glb` | A long barrelled magnum revolver with a heavy underlug, a vent rib, an accessory rail under the shroud and a… |
| Service Pistol | 0.67 MB | 29.6k | slide-open、slide-close、magazine-open、magazine-close、cock | `…/assets/33296/v1/model.glb` | A full size service self loading pistol with a stippled polymer grip, a slide cut optic plate, a dust cover … |
| Service Pistol, Duty Loadout | 0.87 MB | 37.2k | slide-open、slide-close、magazine-open、magazine-close、cock | `…/assets/33455/v1/model.glb` | The service pistol fitted for duty: a miniature reflex sight in the slide cut and a weapon light on the dust… |
| Service Revolver | 0.61 MB | 26.9k | cock、spin | `…/assets/33295/v1/model.glb` | A double action service revolver on a medium frame, with a vent rib barrel, a full underlug shroud and a flu… |
| Single Action Revolver | 0.56 MB | 24.4k | cock、spin | `…/assets/33300/v1/model.glb` | A single action revolver with a plough handle walnut grip, a loading gate on the right of the frame and an e… |
| Snub Revolver | 0.55 MB | 23.6k | cock、spin | `…/assets/33298/v1/model.glb` | A snub nosed five shot revolver with a shrouded hammer profile, a short ejector rod and a compact rubber grip |
| Subcompact Pistol | 0.62 MB | 27.4k | slide-open、slide-close、magazine-open、magazine-close、cock | `…/assets/33292/v1/model.glb` | A subcompact pocket self loader with a shortened grip, a flush fitting magazine and a snag free sight pair |
| Target Pistol | 0.70 MB | 32.1k | slide-open、slide-close、magazine-open、magazine-close、cock | `…/assets/33291/v1/model.glb` | A bull barrel target pistol with a walnut thumb rest grip, an adjustable rear sight on a raised bridge and a… |

**冲锋枪/PDW（主武器） — 11 个，合计 12.5 MB**

| 模型名 | 大小 | 三角面 | 动画 | CDN 直链（`v1/model.glb`） | 造型备注 |
|---|---|---|---|---|---|
| Bullpup SMG | 0.94 MB | 36.3k | magazine-open、magazine-close、charge-open、charge-close | `…/assets/33305/v1/model.glb` | A bullpup submachine gun with the magazine behind the grip, a moulded polymer shell, a full length top rail … |
| Carbine Length SMG | 1.11 MB | 42.7k | stock-open、stock-close、magazine-open、magazine-close、charge-open、charge-close | `…/assets/33308/v1/model.glb` | A carbine length pistol calibre weapon on a rifle pattern receiver, with a long slotted handguard, a collaps… |
| Carbine SMG, Fitted | 1.43 MB | 54.8k | stock-open、stock-close、magazine-open、magazine-close、charge-open、charge-close | `…/assets/33445/v1/model.glb` | The carbine length submachine gun with a reflex sight, a vertical fore grip and a light under the handguard |
| Classic Straight Magazine SMG | 1.20 MB | 45.3k | magazine-open、magazine-close、charge-open、charge-close | `…/assets/33306/v1/model.glb` | A classic straight magazine submachine gun with a walnut fore grip and butt, a slotted barrel jacket and a t… |
| Drum Fed SMG | 1.40 MB | 50.2k | magazine-open、magazine-close、charge-open、charge-close | `…/assets/33309/v1/model.glb` | A drum fed submachine gun with a cased fifty round drum under the receiver, a walnut fore grip, a finned bar… |
| Folding Stock SMG | 0.82 MB | 31.5k | stock-open、stock-close、magazine-open、magazine-close、charge-open、charge-close | `…/assets/33303/v1/model.glb` | A compact pistol calibre submachine gun with a stamped receiver, a ribbed handguard, a side folding stock an… |
| Folding Stock SMG, Suppressed | 1.19 MB | 45.7k | stock-open、stock-close、magazine-open、magazine-close、charge-open、charge-close | `…/assets/33443/v1/model.glb` | The folding stock submachine gun with a suppressor on its threaded muzzle and a reflex sight on the receiver… |
| Integrally Suppressed SMG | 1.06 MB | 46.4k | stock-open、stock-close、magazine-open、magazine-close、charge-open、charge-close | `…/assets/33302/v1/model.glb` | A submachine gun whose barrel runs inside a full length ported suppressor shroud, with a slotted top rail, a… |
| PDW With Brace | 0.99 MB | 39.3k | stock-open、stock-close、magazine-open、magazine-close、charge-open、charge-close | `…/assets/33307/v1/model.glb` | A personal defence weapon on a short buffer tube with a stabilising brace instead of a stock, a slotted hand… |
| PDW, Fitted | 1.49 MB | 58.4k | stock-open、stock-close、magazine-open、magazine-close、charge-open、charge-close | `…/assets/33447/v1/model.glb` | The braced personal defence weapon with a reflex sight, a suppressor on the threaded muzzle and a laser on t… |
| Side Magazine SMG | 0.87 MB | 35.4k | magazine-open、magazine-close、charge-open、charge-close | `…/assets/33304/v1/model.glb` | A side feeding submachine gun whose magazine lies horizontally along the left of the receiver, with a wire f… |

**步枪/卡宾（主武器） — 20 个，合计 26.8 MB**

| 模型名 | 大小 | 三角面 | 动画 | CDN 直链（`v1/model.glb`） | 造型备注 |
|---|---|---|---|---|---|
| Battle Rifle | 1.34 MB | 51.8k | magazine-open、magazine-close、charge-open、charge-close | `…/assets/33324/v1/model.glb` | A full power battle rifle on a long olive receiver, with a heavy twenty round magazine, a slotted handguard,… |
| Bullpup Battle Rifle | 1.33 MB | 51.7k | magazine-open、magazine-close、charge-open、charge-close、bipod-open、bipod-close | `…/assets/33325/v1/model.glb` | A full power bullpup battle rifle with the magazine behind the grip, a long free floating handguard, a full … |
| Bullpup Rifle | 1.19 MB | 45.3k | magazine-open、magazine-close、charge-open、charge-close | `…/assets/33321/v1/model.glb` | A bullpup assault rifle: the magazine and the action sit behind the trigger inside a full length receiver, s… |
| Bullpup Rifle, Optic Loadout | 1.51 MB | 57.5k | magazine-open、magazine-close、charge-open、charge-close | `…/assets/33441/v1/model.glb` | The bullpup rifle with a holographic sight on the full length rail, a fore grip under the handguard and a li… |
| Carry Handle Rifle | 1.10 MB | 38.7k | magazine-open、magazine-close、charge-open、charge-close | `…/assets/33329/v1/model.glb` | An olive service pattern rifle with a fixed carry handle over the receiver carrying the aperture rear sight,… |
| Folding Stock Rifle | 0.89 MB | 34.2k | stock-open、stock-close、magazine-open、magazine-close、charge-open、charge-close | `…/assets/33323/v1/model.glb` | A paratrooper pattern rifle with a stamped receiver, a ribbed polymer handguard and an underfolding tubular … |
| Heavy Tri Rail Carbine | 1.17 MB | 40.0k | stock-open、stock-close、magazine-open、magazine-close、charge-open、charge-close | `…/assets/33330/v1/model.glb` | A heavy barrelled carbine on a quad rail handguard with a barrel carry handle, a side folding stock, a drum … |
| Integrally Suppressed Rifle | 1.57 MB | 68.6k | stock-open、stock-close、magazine-open、magazine-close、charge-open、charge-close | `…/assets/33326/v1/model.glb` | An integrally suppressed rifle in machined alloy whose barrel runs inside a ported alloy shroud for most of … |
| Lever Action Rifle | 1.25 MB | 44.2k | 无 | `…/assets/33342/v1/model.glb` | A tube fed lever action rifle in walnut, with a loop lever under the wrist, a barrel band over the magazine … |
| Long Barrel Rifle | 1.64 MB | 50.5k | magazine-open、magazine-close、charge-open、charge-close | `…/assets/33320/v1/model.glb` | A rifle length assault rifle in machined alloy: a twenty inch barrel inside a quad rail, a top rail running … |
| Long Barrel Rifle, Suppressed | 2.17 MB | 73.5k | magazine-open、magazine-close、charge-open、charge-close | `…/assets/33444/v1/model.glb` | The long barrelled rifle with a rifle suppressor on the threaded muzzle and a four times scope on the receiv… |
| Piston Carbine | 1.17 MB | 39.1k | stock-open、stock-close、magazine-open、magazine-close、charge-open、charge-close | `…/assets/33319/v1/model.glb` | A short stroke gas piston carbine with a quad rail handguard, a folding side stock and a heavy tapered barre… |
| Piston Carbine, Night Loadout | 1.65 MB | 60.6k | stock-open、stock-close、magazine-open、magazine-close、charge-open、charge-close | `…/assets/33440/v1/model.glb` | The piston carbine with a night sight on the receiver rail, a light and laser pair under the quad rail and a… |
| Short Carbine | 1.10 MB | 42.5k | stock-open、stock-close、magazine-open、magazine-close、charge-open、charge-close | `…/assets/33316/v1/model.glb` | A short barrelled assault carbine on a two piece alloy receiver, with a slotted free floating handguard, a c… |
| Short Carbine, CQB Loadout | 1.42 MB | 54.5k | stock-open、stock-close、magazine-open、magazine-close、charge-open、charge-close | `…/assets/33437/v1/model.glb` | The short carbine fitted for close quarters: a reflex sight on the receiver rail, a weapon light under the h… |
| Standard Assault Rifle | 1.08 MB | 37.9k | magazine-open、magazine-close、charge-open、charge-close | `…/assets/33318/v1/model.glb` | A standard issue assault rifle with a ribbed polymer handguard, a fixed stock, an aperture rear sight on the… |
| Standard Rifle, Patrol Loadout | 1.66 MB | 62.6k | magazine-open、magazine-close、charge-open、charge-close | `…/assets/33439/v1/model.glb` | The standard rifle fitted for patrol: a three times prism sight on the rail, an angled fore grip under the h… |
| Straight Pull Rifle | 1.33 MB | 43.9k | magazine-open、magazine-close、bolt-open、bolt-close | `…/assets/33341/v1/model.glb` | A straight pull rifle whose side lever runs back in line with the bore rather than turning: a slim sporting … |
| Tanker Carbine | 0.94 MB | 36.6k | stock-open、stock-close、magazine-open、magazine-close、charge-open、charge-close | `…/assets/33327/v1/model.glb` | A dark earth vehicle crew carbine cut down to the shortest practical barrel, with a stubby handguard, a side… |
| Wood Stock Rifle | 1.29 MB | 44.6k | magazine-open、magazine-close、charge-open、charge-close | `…/assets/33322/v1/model.glb` | A classic wood furniture rifle with a ribbed walnut forend, a slab sided receiver, a fixed walnut stock and … |

**狙击/精确射手（主武器） — 18 个，合计 31.7 MB**

| 模型名 | 大小 | 三角面 | 动画 | CDN 直链（`v1/model.glb`） | 造型备注 |
|---|---|---|---|---|---|
| Anti Materiel Rifle | 2.74 MB | 76.7k | magazine-open、magazine-close、bolt-open、bolt-close、bipod-open、bipod-close | `…/assets/33339/v1/model.glb` | An anti materiel rifle, the longest and heaviest weapon in the pack: a metre of heavy barrel inside a quad r… |
| Anti Materiel Rifle, Scoped | 3.26 MB | 95.7k | magazine-open、magazine-close、bolt-open、bolt-close、bipod-open、bipod-close | `…/assets/33453/v1/model.glb` | The anti materiel rifle with a long eight times scope on the top rail and a laser rangefinder module on the … |
| Battle Marksman Rifle | 1.22 MB | 42.6k | magazine-open、magazine-close、charge-open、charge-close、bipod-open、bipod-close | `…/assets/33332/v1/model.glb` | A full power semi automatic marksman rifle in walnut: a ribbed wooden forend, a comb stock with a raised che… |
| Battle Rifle, Marksman Loadout | 1.99 MB | 79.8k | magazine-open、magazine-close、charge-open、charge-close | `…/assets/33438/v1/model.glb` | The battle rifle set up for marksmanship: an eight times scope on the rail, a muzzle suppressor and a laser … |
| Bullpup Anti Materiel Rifle | 1.31 MB | 48.1k | magazine-open、magazine-close、bolt-open、bolt-close、bipod-open、bipod-close | `…/assets/33340/v1/model.glb` | A bullpup anti materiel rifle: the same calibre in three quarters of the length, with the magazine behind th… |
| Bullpup Marksman Rifle | 1.47 MB | 45.7k | magazine-open、magazine-close、charge-open、charge-close | `…/assets/33333/v1/model.glb` | A bullpup semi automatic marksman rifle in olive polymer: the action sits behind the grip inside the receive… |
| Chassis Bolt Sniper | 1.80 MB | 71.3k | magazine-open、magazine-close、bolt-open、bolt-close、bipod-open、bipod-close | `…/assets/33335/v1/model.glb` | A bolt action sniper rifle in a machined alloy chassis: a long free floating slotted tube out to the muzzle,… |
| Chassis Sniper, Scoped | 2.33 MB | 94.3k | magazine-open、magazine-close、bolt-open、bolt-close、bipod-open、bipod-close | `…/assets/33449/v1/model.glb` | The chassis bolt action sniper with a long eight times scope on its rail and a precision suppressor on the m… |
| Folding Chassis Sniper | 1.42 MB | 45.5k | stock-open、stock-close、magazine-open、magazine-close、bolt-open、bolt-close、bipod-open、bipod-close | `…/assets/33336/v1/model.glb` | A compact bolt action sniper in a dark earth chassis whose stock folds against the receiver for transport, w… |
| Heavy Barrel Sniper | 1.37 MB | 50.1k | magazine-open、magazine-close、bolt-open、bolt-close、bipod-open、bipod-close | `…/assets/33337/v1/model.glb` | A heavy barrel bolt action sniper with no handguard at all: a thick fluted barrel in cooling rings straight … |
| Marksman Rifle | 1.39 MB | 54.3k | magazine-open、magazine-close、charge-open、charge-close、bipod-open、bipod-close | `…/assets/33328/v1/model.glb` | A marksman length rifle with a heavy free floating barrel, a full length top rail for a magnified optic, an … |
| Marksman Rifle, Scoped | 1.92 MB | 77.3k | magazine-open、magazine-close、charge-open、charge-close、bipod-open、bipod-close | `…/assets/33442/v1/model.glb` | The marksman rifle with an eight times scope on its full length rail and a suppressor on the threaded muzzle |
| Semi Auto Marksman Rifle | 1.39 MB | 54.1k | stock-open、stock-close、magazine-open、magazine-close、charge-open、charge-close | `…/assets/33331/v1/model.glb` | A semi automatic designated marksman rifle built on an assault rifle receiver rather than a chassis: a lengt… |
| Semi Auto Marksman, Scoped | 1.92 MB | 77.1k | stock-open、stock-close、magazine-open、magazine-close、charge-open、charge-close | `…/assets/33448/v1/model.glb` | The semi automatic marksman rifle with an eight times scope, a suppressor and a laser on the side rail |
| Straight Pull Rifle, Scoped | 1.86 MB | 66.9k | magazine-open、magazine-close、bolt-open、bolt-close | `…/assets/33452/v1/model.glb` | The straight pull rifle with a four times scope on the rail and a suppressor on the threaded muzzle |
| Suppressed Bolt Sniper | 1.45 MB | 61.9k | magazine-open、magazine-close、bolt-open、bolt-close、bipod-open、bipod-close | `…/assets/33338/v1/model.glb` | A suppressed bolt action sniper in olive: the barrel runs inside a ported shroud for most of its length behi… |
| Wood Sniper, Scoped | 1.56 MB | 55.3k | magazine-open、magazine-close、bolt-open、bolt-close | `…/assets/33450/v1/model.glb` | The walnut stocked bolt action sniper with a four times scope on its receiver rail |
| Wood Stock Bolt Sniper | 1.26 MB | 41.3k | magazine-open、magazine-close、bolt-open、bolt-close | `…/assets/33334/v1/model.glb` | A classic bolt action sniper rifle in a one piece walnut stock with a raised cheek comb, a turned down bolt … |

**霰弹枪（备选，未纳入两类） — 9 个，合计 10.0 MB**

| 模型名 | 大小 | 三角面 | 动画 | CDN 直链（`v1/model.glb`） | 造型备注 |
|---|---|---|---|---|---|
| Bullpup Shotgun | 0.99 MB | 39.6k | open、close | `…/assets/33313/v1/model.glb` | A bullpup pump shotgun with twin tube magazines behind the grip inside the receiver shell, a full length top… |
| Bullpup Shotgun, Fitted | 1.13 MB | 45.0k | open、close | `…/assets/33446/v1/model.glb` | The bullpup shotgun with a holographic sight on its full length rail |
| Magazine Fed Shotgun | 1.31 MB | 52.7k | stock-open、stock-close、magazine-open、magazine-close、charge-open、charge-close | `…/assets/33312/v1/model.glb` | A magazine fed tactical shotgun on a rifle pattern lower, with a slotted handguard, a heat shield over the b… |
| Magazine Shotgun, Fitted | 1.66 MB | 66.0k | stock-open、stock-close、magazine-open、magazine-close、charge-open、charge-close | `…/assets/33451/v1/model.glb` | The magazine fed shotgun with a reflex sight on the receiver rail, a light under the handguard and an angled… |
| Over And Under Shotgun | 1.01 MB | 34.1k | open、close | `…/assets/33314/v1/model.glb` | A break action over and under shotgun with stacked barrels, a ribbed top rib, a chequered walnut stock and f… |
| Pump Shotgun | 1.10 MB | 37.1k | open、close | `…/assets/33311/v1/model.glb` | A tube fed pump action shotgun with a ribbed fore-end on twin action bars, a vent rib barrel with a bead sig… |
| Sawn Off Shotgun | 0.78 MB | 25.3k | open、close | `…/assets/33317/v1/model.glb` | A double barrelled shotgun cut down to a short pair of barrels and a walnut pistol grip, with a lanyard ring… |
| Semi Automatic Shotgun | 1.07 MB | 37.2k | open、close | `…/assets/33310/v1/model.glb` | A gas operated semi automatic shotgun with a tubular magazine under the barrel, a vent rib, a ribbed polymer… |
| Side By Side Shotgun | 0.96 MB | 31.0k | open、close | `…/assets/33315/v1/model.glb` | A break action side by side shotgun with paired barrels, a flat top rib, double triggers and a chequered wal… |


## 4. 质量抽检（7 例，已下载至 /tmp/mwp_qa/，未入项目）

| 抽检项 | `file` 验证 | 预览图目测 |
|---|---|---|
| Service Pistol (33296) | glTF binary v2, 670,728 B | ✔ 全尺寸手枪，聚合物握把+切削光学板 |
| Magnum Revolver (33297) | glTF binary v2, 623,928 B | ✔ 长枪管马格南左轮，下挂导轨 |
| Classic Straight Magazine SMG (33310) | glTF binary v2, 1,196,812 B | ✔ 直弹匣冲锋枪（汤普森式），木托 |
| Standard Assault Rifle (33318) | glTF binary v2, 1,082,372 B | ✔ 标准突击步枪，散热护木+伸缩托 |
| Battle Rifle (33324) | glTF binary v2, 1,336,952 B | ✔ 全威力战斗步枪（FAL 风格） |
| Chassis Bolt Sniper (33344) | glTF binary v2, 1,800,252 B | ✔ 底盘式栓狙，两脚架折叠 |
| Anti Materiel Rifle (33339) | glTF binary v2, 2,742,092 B | ✔ 反器材步枪，1.78 m 长，提把+两脚架 |

- 预览图均为 512×512 webp（`thumb.webp`），造型清晰、比例正确，7/7 确认是枪且与名称相符。
- **体积范围**：手枪 ~0.55~1.25 MB、步枪 0.9~2.2 MB、最大（反器材带瞄具版）3.26 MB。
  全部 49+15 件 ≈ 84 MB（含 Loadout 重复版）；**只取裸枪版约 62 MB**——对网页游戏全量内置偏大，
  **建议按当前 08-weapons 的做法懒加载 CDN 直链**（CORS 开、永久 URL，GLTFLoader 直接可用），
  或只挑 8~12 件内置。三角面 24k~96k/件，比现用 GLB 重（现武器库为低模），近距离手持没问题，
  地面掉落物建议 LOD 或缩放处理。
- 建模规格（manifest description 统一声明）：米制 +Y up、枪口朝 +Z、原点在地面中心；带命名 pivot
 （slide/magazine/bolt 等）与 connector 挂点（muzzle/optic-rail/underbarrel），刚体节点动画
 （magazine-open/close、bolt/charge/slide、bipod 等），无蒙皮无骨骼；PBR 平色**无贴图**（textures=0，
  靠材质色块），对 three.js 很友好。
- 数据均为 AI 生成（manifest `aiGenerated: true`，模型标注 claude-opus-5），但抽检目测质量过关。

## 5. 许可确认

- 每个 asset 的 `license` 字段：`{"slug":"cc0-1.0","name":"CC0 1.0 Universal","url":"https://creativecommons.org/publicdomain/zero/1.0/","attributionRequired":false}`。
- 页面 FAQ 原文（[pack 页](https://3dassets.dev/packs/mega-weapon-pack)）："Every pack on 3DAssets.dev is released under
  CC0 1.0 Universal, which places it in the public domain: use it in a paid game, an app, a film or a client project,
  modify … no attribution required"——**无需署名**，商用可、修改可。
- 站点整体声明 CC0；本包 173 件全部 CC0（`licenseLabel: "CC0 1.0 Universal"`）。
- 与现 assets/ 里 CC-BY 音效不同，这批不需要写 ASSETS.md 署名条目（但建议记录来源 URL 备查）。

## 6. 复现命令

```bash
curl -s https://3dassets.dev/api/v1/packs/mega-weapon-pack -o /tmp/mwp_api.json
# 单个模型
curl -s https://cdn.3dassets.dev/assets/33296/v1/model.glb -o /tmp/mwp_qa/Service_Pistol.glb
file /tmp/mwp_qa/Service_Pistol.glb   # → glTF binary model, version 2
```

## 7. 对游戏的落地建议（供后续开发参考，本次未动代码）

1. 主武器候选池 49 件里挑 6~8 把（如 Standard Assault Rifle / Bullpup Rifle / Battle Rifle /
   Classic Straight Magazine SMG / Folding Stock SMG / Chassis Bolt Sniper / Wood Stock Bolt Sniper），
   副武器从 15 件挑 3~4（Service Pistol / Magnum Revolver / Machine Pistol / Compact Pistol），
   即可把武器库从 5 件扩到 ~10 件，风格统一（同一包、同一坐标系约定）。
2. 与 notes/weapons-v2-spec.md 契约对齐点：包内枪口朝 +Z、原点落地（y=0），而现武器 v2 契约的手持
   rig 坐标系需在接入时换算（08-weapons 的 GLB 加载器已处理缩放/朝向，逐件校准一次即可）。
3. connector 挂点（optic-rail / muzzle / underbarrel）与现有"瞄具系统"天然契合，可考虑直接读取
   GLB 里的命名节点挂瞄具，替代手工偏移。
4. 懒加载：CDN 永久 URL + CORS，运行期 GLTFLoader 直拉即可，不必进 assets/ 仓库体积。
