const SUPABASE_URL = "https://axfcbxgcvqvxbjjyncja.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_xkuFml2vQI7PDhANvcVHDw_ZdjOcLTH";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

async function testSupabase() {
    const { data, error } = await supabaseClient
        .from("homework")
        .select("*");

    if (error) {
        console.error("Supabase 连接失败：", error);
        return;
    }

    console.log("Supabase 连接成功！");
    console.log(data);
}

testSupabase();
// ==============================
// 1. 获取网页元素
// ==============================
const addButton =
    document.getElementById("addButton");
const homeworkForm =
    document.getElementById("homeworkForm");
const submitButton =
    document.getElementById("submitButton");
const subjectInput =
    document.getElementById("subjectInput");
const contentInput =
    document.getElementById("contentInput");
const deadlineInput =
    document.getElementById("deadlineInput");
const fileInput =
    document.getElementById("fileInput");
const homeworkList =
    document.getElementById("homeworkList");
const searchInput =
    document.getElementById("searchInput");
const filterButtons =
    document.querySelectorAll(".filter-button");
// ==============================
// 2. 当前筛选状态
// ==============================
// 当前搜索文字
let searchText = "";
// 当前筛选方式
// all = 全部
// unfinished = 未完成
// completed = 已完成
let currentFilter = "all";
// ==============================
// 3. 获取保存的数据
// ==============================
let homeworkData = [];

async function loadHomework() {
    const { data, error } = await supabaseClient
        .from("homework")
        .select("*");

    if (error) {
        console.error("获取作业失败：", error);
        return;
    }

    homeworkData = data;
    renderHomework();
}

loadHomework();
// ==============================
// 4. 保存数据
// ==============================
function saveHomework() {
    localStorage.setItem(
        "homeworkData",
        JSON.stringify(homeworkData)
    );
}
// ==============================
// 5. 显示添加表单
// ==============================
addButton.addEventListener(
    "click",
    function() {
        homeworkForm.style.display =
            "block";
    }
);
// ==============================
// 6. 显示作业
// ==============================
function renderHomework() {
    // 清空页面
    homeworkList.innerHTML = "";
    // ==========================
    // 按截止日期排序
    // ==========================
    homeworkData.sort(
        function(a, b) {
            return new Date(a.deadline)
                - new Date(b.deadline);
        }
    );
    // ==========================
    // 筛选作业
    // ==========================
    const filteredHomework =
        homeworkData.filter(
            function(homework) {
                // ------------------
                // 第一层：完成状态
                // ------------------
                if (
                    currentFilter === "completed"
                    &&
                    !homework.completed
                ) {
                    return false;
                }
                if (
                    currentFilter === "unfinished"
                    &&
                    homework.completed
                ) {
                    return false;
                }
                // ------------------
                // 第二层：搜索文字
                // ------------------
                const search =
                    searchText.toLowerCase();
                const subject =
                    homework.subject.toLowerCase();
                const content =
                    homework.content.toLowerCase();
                // 如果课程或内容包含搜索文字
                if (
                    !subject.includes(search)
                    &&
                    !content.includes(search)
                ) {
                    return false;
                }
                // 通过筛选
                return true;
            }
        );
    // ==========================
    // 创建卡片
    // ==========================
    filteredHomework.forEach(
        function(homework) {
            // 找到这个作业
            // 在 homeworkData 中真正的编号
            const index =
                homeworkData.indexOf(homework);
            const card =
                document.createElement("div");
            card.className =
                "homework-card";
            // ======================
            // 完成状态
            // ======================
            let completedClass = "";
            let completedText = "未完成";
            if (homework.completed) {
                completedClass =
                    "completed";
                completedText =
                    "已完成";
            }
            // ======================
            // 附件
            // ======================
            let attachmentHTML = "";
            if (
                homework.fileName
                &&
                homework.fileURL
            ) {
                attachmentHTML = `
                    <a
                        class="attachment"
                        href=" "
                        target="_blank"
                    >
                        📎 ${homework.fileName}
                    </a >
                `;
            }
            // ======================
            // 作业卡片
            // ======================
            card.innerHTML = `
                <div class="subject">
                    ${homework.subject}
                </div>
                <h2 class="${completedClass}">
                    ${homework.content}
                </h2>
                <p class="deadline">
                    截止：${homework.deadline}
                </p >
                ${attachmentHTML}
                <div class="card-buttons">
                    <button
                        class="complete-button"
                        data-index="${index}"
                    >
                        ${completedText}
                    </button>
                    <button
                        class="edit-button"
                        data-index="${index}"
                    >
                        编辑
                    </button>
                    <button
                        class="delete-button"
                        data-index="${index}"
                    >
                        删除
                    </button>
                </div>
            `;
            homeworkList.appendChild(card);
        }
    );
    // ==========================
    // 完成按钮
    // ==========================
    const completeButtons =
        document.querySelectorAll(
            ".complete-button"
        );
    completeButtons.forEach(
        function(button) {
            button.addEventListener(
                "click",
                function() {
                    const index =
                        Number(
                            button.dataset.index
                        );
                    homeworkData[index].completed =
                        !homeworkData[index].completed;
                    saveHomework();
                    renderHomework();
                }
            );
        }
    );
    // ==========================
    // 编辑按钮
    // ==========================
    const editButtons =
        document.querySelectorAll(
            ".edit-button"
        );
    editButtons.forEach(
        function(button) {
            button.addEventListener(
                "click",
                function() {
                    const index =
                        Number(
                            button.dataset.index
                        );
                    const homework =
                        homeworkData[index];
                    subjectInput.value =
                        homework.subject;
                    contentInput.value =
                        homework.content;
                    deadlineInput.value =
                        homework.deadline;
                    homeworkForm.style.display =
                        "block";
                    submitButton.textContent =
                        "保存修改";
                    submitButton.dataset.editIndex =
                        index;
                }
            );
        }
    );
    // ==========================
    // 删除按钮
    // ==========================
    const deleteButtons =
        document.querySelectorAll(
            ".delete-button"
        );
    deleteButtons.forEach(
        function(button) {
            button.addEventListener(
                "click",
                function() {
                    const index =
                        Number(
                            button.dataset.index
                        );
                    homeworkData.splice(
                        index,
                        1
                    );
                    saveHomework();
                    renderHomework();
                }
            );
        }
    );
}
// ==============================
// 7. 添加 / 修改作业
// ==============================
submitButton.addEventListener(
    "click",
    async function() {

        // 获取输入
        const subject =
            subjectInput.value.trim();

        const content =
            contentInput.value.trim();

        const deadline =
            deadlineInput.value;

        // 防止空提交
        if (
            !subject ||
            !content ||
            !deadline
        ) {
            alert(
                "请把课程、作业内容和截止日期填写完整。"
            );
            return;
        }

        // 判断是否为编辑
        const editIndex =
            submitButton.dataset.editIndex;

        // 编辑
        if (
            editIndex !== undefined
        ) {
            // 这里暂时还是原来的代码
            homeworkData[
                Number(editIndex)
            ].subject = subject;

            homeworkData[
                Number(editIndex)
            ].content = content;

            homeworkData[
                Number(editIndex)
            ].deadline = deadline;

            delete submitButton.dataset.editIndex;

            submitButton.textContent =
                "添加";
        }

        // 添加
        else {
            const file =
                fileInput.files[0];

            let fileName = "";

            if (file) {
                fileName = file.name;
            }

            const { data, error } =
                await supabaseClient
                    .from("homework")
                    .insert([
                        {
                            subject: subject,
                            content: content,
                            deadline: deadline,
                            file_name: fileName,
                            completed: false
                        }
                    ])
                    .select();

            if (error) {
                console.error(
                    "添加作业失败：",
                    error
                );

                alert(
                    "添加作业失败，请查看控制台。"
                );

                return;
            }

            console.log(
                "添加成功：",
                data
            );
        }

        // 更新页面
        await loadHomework();

        // 清空表单
        subjectInput.value = "";
        contentInput.value = "";
        deadlineInput.value = "";
        fileInput.value = "";
    }
);
// ==============================
// 8. 搜索
// ==============================
searchInput.addEventListener(
    "input",
    function() {
        searchText =
            searchInput.value.trim();
        renderHomework();
    }
);
// ==============================
// 9. 筛选按钮
// ==============================
filterButtons.forEach(
    function(button) {
        button.addEventListener(
            "click",
            function() {
                // 当前筛选方式
                currentFilter =
                    button.dataset.filter;
                // 去掉所有按钮的 active
                filterButtons.forEach(
                    function(otherButton) {
                        otherButton.classList.remove(
                            "active"
                        );
                    }
                );
                // 给当前按钮增加 active
                button.classList.add(
                    "active"
                );
                // 重新显示
                renderHomework();
            }
        );
    }
);
// ==============================
// 10. 第一次打开页面
// ==============================