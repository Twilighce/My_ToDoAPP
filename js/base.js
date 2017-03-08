/**
 * Created by 32321 on 2017/3/4.
 */
;(function () {
    'use strict';

    var $form_add_task = $('.add-task')
        , $task_detail
        , $task_delete_trigger
        , $task_detail_trigger
        , $task_detail = $('.task-detail')
        , $task_detail_mask = $('.task-detail-mask')
        , task_list = []
        , current_index
        , $update_form
        , $task_detail_content
        , $task_detail_content_input
        ;

    init();

    //noinspection JSAnnotator
    $form_add_task.on('submit', on_add_task_form_submit)
    $task_detail_mask.on('click', hide_task_detail)

    function on_add_task_form_submit(e) {
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
    }

    /*
     * 查找并监听详情按钮的点击事件
     */
    function listen_task_detail() {
        $task_detail_trigger.on('click', function () {
            var $this = $(this);
            var $item = $this.parent().parent();
            var index = $item.data('index');
            show_task_detail(index);
        })
    }


    /*
     * 查看 Task 详情
     */
    function show_task_detail(index) {
        render_task_detail(index);
        current_index = index;
        $task_detail.show();
        $task_detail_mask.show();
    }

    function update_task(index, data) {
        if (!index || !task_list[index])
            return;

        task_list[index] = data;
        refresh_task_list();
    }

    function hide_task_detail() {
        $task_detail.hide();
        $task_detail_mask.hide();
    }

    /*
     * 渲染指定 Task 的详细信息
     */
    function render_task_detail(index) {
        if (index === undefined || !task_list[index])
            return;

        var item = task_list[index];

        var tpl =
            '<form>' +
            '<div class="content">' +
            item.content +
            '</div>' +
            '<div>' +
            '<input style="display:none;" ' +
            'type="text" name="content" value="' +
            item.content + '">' +
            '</div>' +
            '<div>' +
            '<div class="desc">' +
            '<textarea name="desc">' +
            item.desc +
            '</textarea>' +
            '</div>' +
            '</div>' +
            '<div class="remind">' +
            '<input name="remind_date" type="date" value="'
            + item.remind_date + '">' +
            '</div>' +
            '<div><button type="submit">update</button></div>' +
            '</form>';

        $task_detail.html('');
        $task_detail.html(tpl);
        $update_form = $task_detail.find('form');
        $task_detail_content = $update_form.find('.content');
        $task_detail_content_input = $update_form.find('[name=content]');

        $task_detail_content.on('dblclick', function () {
            $task_detail_content_input.show();
            $task_detail_content.hide();
        })


        $update_form.on('submit', function(e) {
            e.preventDefault();
            var data = {};
            data.content = $(this).find('[name=content]').val();
            data.desc = $(this).find('[name=desc]').val();
            data.remind_date = $(this).find('[name=remind_date]').val();

            update_task(index, data);
            hide_task_detail();
        })
    }

    /*
     * 查找并监听删除按钮的点击事件
     */
    function listen_task_delete() {
        $task_delete_trigger.on('click', function() {
            //把当前点击的元素变成 jQuery object
            var $this = $(this);
            //查找删除按钮所在的 task元素
            var $item = $this.parent().parent();
            var index = $item.data('index');
            //确认删除
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

    /*
     * 刷新 localStorage 并渲染模板
     */
    function refresh_task_list() {
        store.set('task_list', task_list);
        render_task_list();
    }

    /*
     * 删除一条task
     */
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

    /*
     * 渲染所有 Task 模板
     */
    function render_task_list() {
        var $task_list = $('.task-list');
        $task_list.html('');
        for(var i = 0; i < task_list.length; i++) {
            var $task = render_task_item(task_list[i],i);
            $task_list.append($task);
        }

        $task_delete_trigger = $('.action.delete')
        $task_detail_trigger = $('.action.detail')
        listen_task_delete();
        listen_task_detail();
    }

    /*
     * 渲染单条Task模板
     */
    function render_task_item(data, index) {
        if(!data || !index) return;
        var list_item_tpl =
            '<div class="task-item" data-index="' + index + '">' +
            '<span><input type="checkbox"></span>' +
            '<span class="task-content">' + data.content + '</span>' +
            '<span class="fr">' +
            '<span class="action delete"> delete</span>' +
            '<span class="action detail"> detail</span>' +
            '</span>' +
            '</div>';
        return $(list_item_tpl);
    }
})();