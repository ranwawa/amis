import {Button} from 'amis';
import React from 'react';
import {
  registerEditorPlugin,
  BaseEventContext,
  BasePlugin,
  RendererPluginAction,
  diff,
  defaultValue,
  getSchemaTpl,
  CodeEditor as AmisCodeEditor,
  RendererPluginEvent,
  tipedLabel
} from 'amis-editor-core';
import {getEventControlConfig} from '../renderer/event-control/helper';

const ChartConfigEditor = ({value, onChange}: any) => {
  return (
    <div className="ae-JsonEditor">
      <AmisCodeEditor value={value} onChange={onChange} />
    </div>
  );
};

const DEFAULT_EVENT_PARAMS = [
  {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        title: '数据',
        properties: {
          componentType: {
            type: 'string',
            title: 'componentType'
          },
          seriesType: {
            type: 'string',
            title: 'seriesType'
          },
          seriesIndex: {
            type: 'number',
            title: 'seriesIndex'
          },
          seriesName: {
            type: 'string',
            title: 'seriesName'
          },
          name: {
            type: 'string',
            title: 'name'
          },
          dataIndex: {
            type: 'number',
            title: 'dataIndex'
          },
          data: {
            type: 'object',
            title: 'data'
          },
          dataType: {
            type: 'string',
            title: 'dataType'
          },
          value: {
            type: 'number',
            title: 'value'
          },
          color: {
            type: 'string',
            title: 'color'
          }
        }
      }
    }
  }
];

const chartDefaultConfig = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line'
    }
  ],
  backgroundColor: 'transparent'
};

export class ChartPlugin extends BasePlugin {
  static id = 'ChartPlugin';
  // 关联渲染器名字
  rendererName = 'chart';
  $schema = '/schemas/ChartSchema.json';

  // 组件名称
  name = '图表';
  isBaseComponent = true;
  description =
    '用来渲染图表，基于 echarts 图表库，理论上 echarts 所有图表类型都支持。';
  docLink = '/amis/zh-CN/components/chart';
  tags = ['展示'];
  icon = 'fa fa-pie-chart';
  pluginIcon = 'chart-plugin';
  scaffold = {
    type: 'chart',
    config: chartDefaultConfig,
    replaceChartOption: true
  };
  previewSchema = {
    ...this.scaffold
  };

  // 事件定义
  events: RendererPluginEvent[] = [
    {
      eventName: 'init',
      eventLabel: '初始化',
      description: '组件实例被创建并插入 DOM 中时触发',
      dataSchema: [
        {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              title: '数据',
              description: '当前数据域，可以通过.字段名读取对应的值'
            }
          }
        }
      ]
    },
    {
      eventName: 'click',
      eventLabel: '鼠标点击',
      description: '鼠标点击时触发',
      dataSchema: DEFAULT_EVENT_PARAMS
    },
    {
      eventName: 'mouseover',
      eventLabel: '鼠标悬停',
      description: '鼠标悬停时触发',
      dataSchema: DEFAULT_EVENT_PARAMS
    },
    {
      eventName: 'legendselectchanged',
      eventLabel: '切换图例选中状态',
      description: '切换图例选中状态时触发',
      dataSchema: [
        {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              title: '数据',
              properties: {
                name: {
                  type: 'string',
                  title: 'name'
                },
                selected: {
                  type: 'object',
                  title: 'selected'
                }
              }
            }
          }
        }
      ]
    }
  ];

  // 动作定义
  actions: RendererPluginAction[] = [
    {
      actionType: 'reload',
      actionLabel: '重新加载',
      description: '触发组件数据刷新并重新渲染'
    },
    {
      actionType: 'setValue',
      actionLabel: '变量赋值',
      description: '触发组件数据更新'
    }
    // 特性动作太多了，这里先不加了，可以通过写代码配置
  ];

  panelTitle = '图表';
  panelBodyCreator = (context: BaseEventContext) => {
    return [
      getSchemaTpl('tabs', [
        {
          title: '属性',
          body: [
            getSchemaTpl('collapseGroup', [
              {
                title: '基本',
                body: [
                  getSchemaTpl('layout:originPosition', {value: 'left-top'}),
                  getSchemaTpl('name')
                ]
              },
              {
                title: '数据设置',
                body: [
                  /*
                  {
                    type: 'select',
                    name: 'chartDataType',
                    label: '数据获取方式',
                    value: 'json',
                    onChange(value: any, oldValue: any, model: any, form: any) {
                      if (value === 'json') {
                        form.setValueByName('api', undefined);
                        form.setValueByName('config', chartDefaultConfig);
                      } else {
                        form.setValueByName('config', undefined);
                      }
                    },
                    options: [
                      {
                        label: '接口数据',
                        value: 'dataApi'
                      },
                      {
                        label: '静态JSON数据',
                        value: 'json'
                      }
                    ]
                  },
                  */
                  getSchemaTpl('apiControl', {
                    label: '数据接口',
                    // visibleOn: 'chartDataType === "dataApi"',
                    description:
                      '接口可以返回echart图表完整配置，或者图表数据，建议返回图表数据映射到 Echarts 配置中'
                  }),

                  getSchemaTpl('switch', {
                    label: '初始是否拉取',
                    name: 'initFetch',
                    // visibleOn: 'chartDataType === "dataApi" && data.api',
                    visibleOn: 'data.api',
                    pipeIn: defaultValue(true)
                  }),

                  {
                    name: 'interval',
                    label: '定时刷新间隔',
                    type: 'input-number',
                    step: 500,
                    // visibleOn: 'chartDataType === "dataApi" && data.api',
                    visibleOn: 'data.api',
                    description: '设置后将自动定时刷新，最小3000, 单位 ms'
                  },
                  {
                    name: 'config',
                    asFormItem: true,
                    // visibleOn: 'chartDataType === "json"',
                    component: ChartConfigEditor,
                    // type: 'json-editor',
                    label: tipedLabel(
                      'Echarts 配置',
                      '支持数据映射，可将接口返回的数据填充进来'
                    )
                  },
                  {
                    name: 'dataFilter',
                    type: 'js-editor',
                    allowFullscreen: true,
                    label: '数据映射（dataFilter）',
                    size: 'lg',
                    description: `
                    如果后端没有直接返回 Echart 配置，可以自己写一段函数来包装。
                    <p>签名：(config, echarts, data) => config</p>
                    <p>参数说明</p>
                    <ul>
                    <li><code>config</code> 原始数据</li>
                    <li><code>echarts</code> echarts 对象</li>
                    <li><code>data</code> 如果配置了数据接口，接口返回的数据通过此变量传入</li>
                    </ul>
                    <p>示例</p>
                    <pre>debugger; // 可以浏览器中断点调试\n\n// 查看原始数据\nconsole.log(config)\n\n// 返回新的结果 \nreturn {}</pre>
                    `
                  },
                  getSchemaTpl('switch', {
                    label: 'Chart 配置完全替换',
                    name: 'replaceChartOption',
                    labelRemark: {
                      trigger: 'click',
                      className: 'm-l-xs',
                      rootClose: true,
                      content:
                        '默认为追加模式，新的配置会跟旧的配置合并，如果勾选将直接完全覆盖。',
                      placement: 'left'
                    }
                  })
                ]
              },
              {
                title: '图表下钻',
                body: [
                  {
                    name: 'clickAction',
                    asFormItem: true,
                    children: ({onChange, value}: any) => (
                      <div className="m-b">
                        <Button
                          size="sm"
                          level={value ? 'danger' : 'info'}
                          onClick={this.editDrillDown.bind(this, context.id)}
                        >
                          配置 DrillDown
                        </Button>

                        {value ? (
                          <Button
                            size="sm"
                            level="link"
                            className="m-l"
                            onClick={() => onChange('')}
                          >
                            删除 DrillDown
                          </Button>
                        ) : null}
                      </div>
                    )
                  }
                ]
              },
              getSchemaTpl('status')
            ])
          ]
        },
        {
          title: '外观',
          body: getSchemaTpl('collapseGroup', [
            ...getSchemaTpl('theme:common', {exclude: ['layout']}),
            {
              title: '自定义 CSS 类名',
              body: [getSchemaTpl('className')]
            }
          ])
        },
        {
          title: '事件',
          className: 'p-none',
          body: [
            getSchemaTpl('eventControl', {
              name: 'onEvent',
              ...getEventControlConfig(this.manager, context)
            })
          ]
        }
      ])
    ];
  };

  editDrillDown(id: string) {
    const manager = this.manager;
    const store = manager.store;
    const node = store.getNodeById(id);
    const value = store.getValueOf(id);

    const dialog = (value.clickAction && value.clickAction.dialog) || {
      title: '标题',
      body: ['<p>内容 <code>${value|json}</code></p>']
    };

    node &&
      value &&
      this.manager.openSubEditor({
        title: '配置 DrillDown 详情',
        value: {
          type: 'container',
          ...dialog
        },
        slot: {
          type: 'container',
          body: '$$'
        },
        typeMutable: false,
        onChange: newValue => {
          newValue = {
            ...value,
            clickAction: {
              actionType: 'dialog',
              dialog: newValue
            }
          };
          manager.panelChangeValue(newValue, diff(value, newValue));
        }
      });
  }
}

registerEditorPlugin(ChartPlugin);
