// 检测当前语言设置
const isEnglish = localStorage.getItem("lang") === "en";

// 工具函数：根据语言返回对应文本
const getText = (zh, en) => isEnglish ? en : zh;


const tip_map={
    formula:getText(`你可以用数学公式功能在编辑器里写公式，用 $公式内容$ 来触发行内公式，支持 LaTeX/Markdown 语法。<br/>例如：输入 $E = mc^2$ 会显示为 E = mc²。`,`You can write math formulas in the editor using $formula$ for inline math. It supports LaTeX/Markdown syntax.<br/>Example: typing $E = mc^2$ will render as E = mc².`),
    details:getText(`“详情折叠”功能，在编辑器里插入一个可展开/收起的区域，含有标题和内容两部分，点击标题左侧的按钮即可展开或折叠。`,`The “Details” feature lets you insert a collapsible section in the editor to hide optional content. Click the button on the left of the title to expand or collapse it.`),
    
}
export const AiMenuItems = [
    { img: "zai.png", name: getText("AI辅助", "AI assistance"), key: "aiWrite" },
];
export const tableMenuItems = [
    { icon: "icon-shanchuhang", name: getText("删除本行", "Delete Row"), key: "deleteRow" },
    { icon: "icon-shanchulie", name: getText("删除本列", "Delete Column"), key: "deleteColumn" },
    { icon: "icon-fengedanyuange", name: getText("分割单元格", "Split Cell"), key: "splitCell" },
    { icon: "icon-shanchubiaoge", name: getText("删除表格", "Delete Table"), key: "deleteTable" },
    { icon: "icon-xiufubiaoge", name: getText("修复表格", "Fix Table"), key: "fixTable" }
];

export const baseMenuItems = [
    { icon: "icon-zhengwen", name: getText("正文", "Body Text"), key: "text", shortcut: "Ctrl + Alt + 0" },
    { icon: "icon-H1", name: getText("标题 1", "Heading 1"), key: "h1", shortcut: "Ctrl + Alt + 1" },
    { icon: "icon-H2", name: getText("标题 2", "Heading 2"), key: "h2", shortcut: "Ctrl + Alt + 2" },
    { icon: "icon-H3", name: getText("标题 3", "Heading 3"), key: "h3", shortcut: "Ctrl + Alt + 3" },
    { icon: "icon-H4", name: getText("标题 4", "Heading 4"), key: "h4", shortcut: "Ctrl + Alt + 4" },
    { icon: "icon-H5", name: getText("标题 5", "Heading 5"), key: "h5", shortcut: "Ctrl + Alt + 5" },
    { icon: "icon-H6", name: getText("标题 6", "Heading 6"), key: "h6", shortcut: "Ctrl + Alt + 6" },
    { icon: "icon-wuxuliebiao", name: getText("无序列表", "Unordered List"), key: "ul" },
    { icon: "icon-youxuliebiao", name: getText("有序列表", "Ordered List"), key: "ol" },
    { icon: "icon-daiban", name: getText("待办列表", "Todo List"), key: "todo" },
    { icon: "icon-yinyong", name: getText("引用", "Quote"), key: "quote" }
];

export const generalMenuItems = [
    { icon: "icon-fengexian", name: getText("分割线", "Horizontal Line"), key: "hr" },
    { icon: "icon-tupian", name: getText("图片", "Image"), key: "image" },
    { icon: "icon-lianjie1", name: getText("链接", "Link"), key: "link" },
    { icon: "icon-AI-wenjianshangchuan", name: getText("附件", "Attachment"), key: "file" },
    { icon: "icon-hangneidaima", name: getText("代码", "Code"), key: "code" },
    { icon: "icon-a-8", name: getText("公式", "Formula"), key: "formula", tip:tip_map['formula']  },
    { icon: "icon-a-siweidaotu2", name: getText("折叠", "Details"), key: "details" },
    // { icon: "icon-a-word1", name: getText("导入word", "Import Word"), key: "word"},
];

export const thirdPartyItems = [
    { img: "mermaid.png", name: getText("Mermaid", "Mermaid"), key: "mermaid" },
    { img: "zdr.png", name: getText("Drawio", "Drawio"), key: "drawio" },
    { img: "word.png", name: getText("导入word", "Import Word"), key: "word"},
    { img: "pdf.png", name: getText("导入pdf", "Import Pdf"), key: "pdf"},
    { img: "zma.png", name: getText("导入Markdown", "Import Markdown"), key: "markdown" },
    // { img: "zai.png", name: getText("AI辅助", "AI assistance"), key: "aiWrite" },
    // { img: "ait.svg", name: getText("AI段落翻译", "AI Block Translation"), key: "aiTranslate" },
    // { img: "zfy.png", name: getText("AI全文翻译", "AI Full Translation"), key: "aiTranslateAll" },
];



