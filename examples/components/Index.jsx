/*
 * @Description:
 * @Date: 2023-11-15 07:01:06
 * @Author: ranqirong 274544338@qq.com
 */
export default {
  type: 'page',
  data: {
    ids: [1025]
  },
  body: [
    {
      type: 'crud',
      api: {
        method: 'post',
        url: 'http://mock.apifox.com/m2/3216308-0-default/119577290'
      },
      bulkActions: [
        {
          type: 'button',
          label: '批量操作'
        }
      ],
      selected: [{id: 1025}],
      valueField: 'id',
      rowClassNameExpr:
        "<%= !!data.displayInCell ? 'zmn-table-display-in-cell' : '' %>",
      onEvent: {
        selectedChange: {
          actions: [
            {
              actionType: 'custom',
              script(context, doAction, event) {
                const rows = context.props.store.falttenedRows;
                const currentItem = event.data.currentItem;

                if (!currentItem) {
                  return;
                }

                const cur = rows.find(row => row.data.id === currentItem.id);

                const selectedChildrenIds = cur.checked
                  ? cur.children.map(child => child.data.id).join(',')
                  : '';

                cur.change({
                  ...cur.data,
                  selectedChildrenIds
                });
              }
            }
          ]
        }
      },
      headerToolbar: ['bulkActions'],
      columns: [
        {
          name: 'name',
          align: 'left',
          label: '分类',
          width: '120'
        },
        {
          name: 'selectedChildrenIds',
          label: 'children',
          type: 'checkboxes',
          source: '${displayInCell ? children : []}',
          placeholder: '-',
          labelField: 'name',
          valueField: 'id',
          onEvent: {
            change: {
              actions: [
                {
                  actionType: 'custom',
                  script(event, doAction, context) {
                    const {
                      value,
                      __super: {children}
                    } = context.data;
                    const selectedIds = value.split(',');
                    const unselectedIds = children
                      .filter(child => !selectedIds.includes(child.id + ''))
                      .map(child => child.id);

                    const {rows, unSelectedRows, selectedRows} =
                      event.props.store;

                    selectedIds.forEach(item => {
                      const row = unSelectedRows.find(row => {
                        return row.data.id == item;
                      });
                      row && row.toggle(true);
                    });

                    unselectedIds.forEach(item => {
                      const row = selectedRows.find(row => {
                        return row.data.id == item;
                      });
                      if (row) {
                        console.log('取消');
                      }
                      row && row.toggle(false);
                    });
                  }
                }
              ]
            }
          }
        }
      ]
    }
  ]
};
