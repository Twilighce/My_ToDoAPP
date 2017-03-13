/**
 * Created by 32321 on 2017/3/4.
 */
;(function () {
    'use strict';

    var $form_add_task = $('.add-task')
        , $task_delete_trigger
        , $task_detail_trigger
        , $task_detail = $('.task-detail')
        , $task_detail_mask = $('.task-detail-mask')
        , task_list = []
        , current_index
        , $update_form
        , $task_detail_content
        , $task_detail_content_input
        , $checkbox_complete
        , $msg = $('.msg')
        , $msg_content = $msg.find('.msg-content')
        , $msg_confirm = $msg.find('button')
        ;

    init();

    //noinspection JSAnnotator
    $form_add_task.on('submit', on_add_task_form_submit)
    $task_detail_mask.on('click', hide_task_detail)

    /*
    function listen_msg_event() {
        $msg.confirm.on('click', function () {
            hide_msg();
        })
    }
    */

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
     * 监听查看 Task 详情事件
     */
    function listen_task_detail() {
        var index;
        $('.task-item').on('dblclick', function () {
            index = $(this).data('index');
            show_task_detail(index);
        })

        $task_detail_trigger.on('click', function () {
            var $this = $(this);
            var $item = $this.parent().parent();
            index = $item.data('index');
            show_task_detail(index);
        })
    }

    function listen_checkbox_complete() {
        $checkbox_complete.on('click', function() {
            var $this = $(this);

            var index = $this.parent().parent().data('index');
            var item = get(index);
            if (item.complete) {
                update_task(index, {complete:false});
                //$this.attr('checked', true);
            }
            else {
                update_task(index, {complete:true});
                //$this.attr('checked', false);
            }
        })
    }

    function get(index) {
        return store.get('task_list')[index];
    }
    

    /*
     * 查看 Task 详情
     */
    function show_task_detail(index) {
        /* 生成详情模板 */
        render_task_detail(index);
        current_index = index;
        /* 显示详情模板（默认隐藏 */
        $task_detail.show();
        /* 显示详情模板mask（默认隐藏 */
        $task_detail_mask.show();
    }

    /*
     * 更新 task
     */
    function update_task(index, data) {
        if (!index || !task_list[index])
            return;

        task_list[index] = $.extend({}, task_list[index], data);
        refresh_task_list();
    }

    /*
     * 隐藏 task 详情
     */
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
            '<div class="input-item">' +
            '<input style="display:none;" ' +
            'type="text" name="content" value="' +
            (item.content || '') + '">' +
            '</div>' +
            '<div>' +
            '<div class="desc input-item">' +
            '<textarea name="desc">' +
            (item.desc || '') +
            '</textarea>' +
            '</div>' +
            '</div>' +
            '<div class="remind input-item">' +
            '<input class="datetime" name="remind_date" type="date" value="'
            + (item.remind_date || '') + '">' +
            '</div>' +
            '<div class="input-item"><button type="submit">update</button></div>' +
            '</form>';

        /* 清空 Task 详情模板*/
        $task_detail.html('');
        /* 用新模板替换旧模板 */
        $task_detail.html(tpl);
        //$('.datetime').datetimepicker();

        /* 选中其中的form元素，因为之后会使用其监听 submit 事件*/
        $update_form = $task_detail.find('form');
        /* 选中显示 Task 内容的元素*/
        $task_detail_content = $update_form.find('.content');
        /* 选中Task input 的元素*/
        $task_detail_content_input = $update_form.find('[name=content]');

        /* 双击内容元素显示 input，隐藏自己*/
        $task_detail_content.on('dblclick', function () {
            $task_detail_content_input.show();
            $task_detail_content.hide();
        })


        $update_form.on('submit', function(e) {
            e.preventDefault();
            var data = {};

            /* 获取表单中各个 input 的值*/
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
        //listen_msg_event();
        if (task_list.length)
            render_task_list();
        //task_remind_check();
    }

    /*
    function task_remind_check() {
        var current_timestamp;
        var itl = setInterval(function () {
            for (var i = 0; i < task_list.length; i++) {
                var item = get(i), task_timestamp;
                if (!item || !item.remind_date || itenm.informed)
                    continue;

                current_timestamp = (new Data()).getTime();
                task_timestamp = (new Date(item.remind_date)).getTime();
                if(current_timestamp - task_timestamp >= 1) {
                    update_task(i, {informed: true});
                    show_msg(item.content);
                }
            }
        }, 300);
    }

    function show_msg(msg) {
        $msg_content.html(msg);
        $msg.show();
    }

    function hide_msg(msg) {
        $msg.hide();
    }
    */

    /*
     * 渲染所有 Task 模板
     */
    function render_task_list() {
        var $task_list = $('.task-list');
        $task_list.html('');
        var complete_items = [];


        for (var i = 0; i < task_list.length; i++) {
            var item = task_list[i];
            if (item && item.complete)
                complete_items.push(item);
            else
                var $task = render_task_item(item,i);
            $task_list.prepend($task);
        }


        /*
        for (var j = 0; j < complete_items.length; j++) {
            $task = render_task_item(item, j);
            if(!$task) continue;
            $task.addClass('completed');
            $task_list.append($task);
        }
        */

        $task_delete_trigger = $('.action.delete')
        $task_detail_trigger = $('.action.detail')
        $checkbox_complete = $('.task-list .complete[type=checkbox]')
        listen_task_delete();
        listen_task_detail();
        listen_checkbox_complete();
    }

    /*
     * 渲染单条Task模板
     */
    function render_task_item(data, index) {
        if(!data || !index) return;
        var list_item_tpl =
            '<div class="task-item" data-index="' + index + '">' +
            '<span><input class="complete" ' + (data.complete ? 'checked' : '') + ' type="checkbox"></span>' +
            '<span class="task-content">' + data.content + '</span>' +
            '<span class="fr">' +
            '<span class="action delete"> delete</span>' +
            '<span class="action detail"> detail</span>' +
            '</span>' +
            '</div>';
        return $(list_item_tpl);
    }
})();