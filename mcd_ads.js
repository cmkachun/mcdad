/**
 * 麦当劳首页空白深度隐藏脚本 (适配 api2) - cmkachun
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 1. 针对 api2 的首页布局接口进行隐藏
        // 目标：删除首页所有视频、广告、弹窗容器，让下方内容自动上移
        if (url.includes("/bff/portal/home")) {
            if (obj.data && obj.data.sections) {
                obj.data.sections = obj.data.sections.filter(section => {
                    const sName = (section.sectionName || "").toLowerCase();
                    // 只要包含这些词，说明是广告位或视频位，直接从数据里彻底剔除
                    const isAdBlock = ["video", "splash", "adv", "banner", "hot", "pop"].some(k => sName.includes(k));
                    if (isAdBlock) console.log(`cmkachun: 已物理隐藏首页空白位 [${sName}]`);
                    return !isAdBlock;
                });
            }
        }

        // 2. 针对 api2 的模块配置接口进行清理
        if (url.includes("/bff/portal/version/mdl")) {
            if (obj.data && obj.data.modules) {
                const blacklist = ["splash", "pop", "adv", "video", "guide"];
                obj.data.modules = obj.data.modules.filter(m => {
                    const mName = (m.moduleName || "").toLowerCase();
                    return !blacklist.some(k => mName.includes(k));
                });
            }
            // 启用审计模式
            if (obj.hasOwnProperty('audit')) obj.audit = true;
        }

        body = JSON.stringify(obj);
    } catch (e) {
        // 如果 JSON 解析失败，则执行万能链接替换
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
