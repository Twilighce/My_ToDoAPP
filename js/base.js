/**
 * Created by 32321 on 2017/3/4.
 */
;(function () {
    'use strict';

    var $form_add_task = $('.add-task')
        , $delete_task
        , task_list = {}
        ;


    init();

    //noinspection JSAnnotator
    $form_add_task.on('submit', function (e) {
        var new_task = {};
        /* 禁用默认行为 */
        e.preventDefault();

        /* 获取新 Task 的值 */
        var $input;
        $input = $(this).find('input[name=content]');
        new_task.content = $input.val();
        /* 如果新 Task 的值为空，则直接返回。否则继续执行*/
        if (!new_task.content) return;
        /* 存入新 Task */
        if (add_task(new_task)) {
            //render_task_list();
            $input.val(null);
        }
    })

    function listen_task_delete() {
        $delete_task.on('click', function() {
            //把当前点击的元素变成 jQuery object
            var $this = $(this);
            //选中 task_item 这一行
            var $item = $this.parent().parent();
            var index = delete_task('index');

            var tmp = confirm('确定删除');
            tmp ? delete_task(index) : null;
        })
    }


    function add_task(new_task) {
        /* 将新 Task 推入 task_list */
        task_list.push(new_task);
        /* 更新 localStorage */
        refresh_task_list();
        return true;
    }

    /* 刷新 localStorage 并渲染模板 */
    function refresh_task_list() {
        store.set('task_list', task_list);
        render_task_list();
    }

    function delete_task(index) {
        //如果没有 index 或 Index 不存在，则直接返回
        if(index == undefined || !task_list[index]) return;

        delete task_list[index];

        /* 更新 localStorage */
        refresh_task_list();
    }

    function init() {
      task_list = store.get('task_list') || [];
      if (task_list.length)
          render_task_list();
    }

    // 渲染多条
    function render_task_list() {
        var $task_list = $('.task-list');
        $task_list.html('');
        for(var i = 0; i < task_list.length; i++) {
            var $task = render_task_item(task_list[i],i);
            $task_list.append($task);
        }

        $delete_task = $('.action.delete');
        listen_task_delete();
    }

    //渲染一条
    function render_task_item(data, index) {
        if(!data || !index) return;
        var list_item_tpl =
            '<div class="task-item" data-index="' + index + '">' +
            '<span><input type="checkbox"></span>' +
            '<span class="task-content">' + data.content + '</span>' +
            '<span class="fr">' +
            '<span class="action delete"> delete</span>' +
            '<span class="action"> detail</span>' +
            '</span>' +
            '</div>';
        return $(list_item_tpl);
    }
})();