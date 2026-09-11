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
                homework.file_name &&
                homework.file_url
            ) {
                attachmentHTML =
                    '<a class="attachment" href="' +
                    homework.file_url +
                    '" target="_blank">' +
                    '📎 ' +
                    homework.file_name +
                    '</a >';
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
                        data-id="${homework.id}"
                    >
                        ${completedText}
                    </button>
                    <button
                        class="edit-button"
                        data-id="${homework.id}"
                    >
                        编辑
                    </button>
                    <button
                        class="delete-button"
                        data-id="${homework.id}"
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
                async function() {
                    const id =
                        Number(
                            button.dataset.id
                        );

                    const homework =
                        homeworkData.find(
                            function(item) {
                                return item.id === id;
                            }
                        );

                    if (!homework) {
                        return;
                    }

                    const newCompleted =
                        !homework.completed;

                    const { error } =
                        await supabaseClient
                            .from("homework")
                            .update({
                                completed:
                                    newCompleted
                            })
                            .eq(
                                "id",
                                id
                            );

                    if (error) {
                        console.error(
                            "修改完成状态失败：",
                            error
                        );
                        alert(
                            "修改失败，请查看控制台。"
                        );
                        return;
                    }

                    await loadHomework();
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
                    const id =
                        Number(
                            button.dataset.id
                        );

                    const homework =
                        homeworkData.find(
                            function(item) {
                                return item.id === id;
                            }
                        );

                    if (!homework) {
                        return;
                    }

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

                    submitButton.dataset.editId =
                        id;
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
                async function() {
                    const id =
                        Number(
                            button.dataset.id
                        );

                    const { error } =
                        await supabaseClient
                            .from("homework")
                            .delete()
                            .eq(
                                "id",
                                id
                            );

                    if (error) {
                        console.error(
                            "删除作业失败：",
                            error
                        );

                        alert(
                            "删除失败，请查看控制台。"
                        );

                        return;
                    }

                    await loadHomework();
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

        // 编辑
        const editId =
            submitButton.dataset.editId;

        if (
            editId !== undefined
        ) {
            const { error } =
                await supabaseClient
                    .from("homework")
                    .update({
                        subject: subject,
                        content: content,
                        deadline: deadline
                    })
                    .eq(
                        "id",
                        Number(editId)
                    );

            if (error) {
                console.error(
                    "修改作业失败：",
                    error
                );

                alert(
                    "修改失败，请查看控制台。"
                );

                return;
            }

            delete submitButton.dataset.editId;

            submitButton.textContent =
                "添加";
        }

        // 添加
        else {
            const file =
                fileInput.files[0];

            let fileName = "";
            let fileURL = "";

            // 如果选择了文件
            if (file) {
                fileName = file.name;

                // 给文件生成一个不会轻易重复的路径
                const fileExtension =
                    file.name.includes(".")
                        ? file.name.substring(
                            file.name.lastIndexOf(".")
                        )
                        : "";

                const filePath =
                    Date.now() + fileExtension;

                // 上传到 Supabase Storage
                const { error: uploadError } =
                    await supabaseClient
                        .storage
                        .from("homework-files")
                        .upload(
                            filePath,
                            file
                        );

                if (uploadError) {
                    console.error(
                        "文件上传失败：",
                        uploadError
                    );

                    alert(
                        "文件上传失败，请查看控制台。"
                    );

                    return;
                }

                // 获取公开访问地址
                const { data: urlData } =
                    supabaseClient
                        .storage
                        .from("homework-files")
                        .getPublicUrl(
                            filePath
                        );

                fileURL =
                    urlData.publicUrl;
            }

            // 把作业信息保存到数据库
            const { data, error } =
                await supabaseClient
                    .from("homework")
                    .insert([
                        {
                            subject: subject,
                            content: content,
                            deadline: deadline,
                            file_name: fileName,
                            file_url: fileURL,
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