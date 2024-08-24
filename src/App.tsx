import './App.css';
import { bitable, ITableMeta, IFieldMeta, Selection, FieldType, IOpenSegment } from "@lark-base-open/js-sdk";
import { Button, Form } from '@douyinfe/semi-ui';
import { BaseFormApi } from '@douyinfe/semi-foundation/lib/es/form/interface';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Space } from '@douyinfe/semi-ui';
import { MonacoDiffEditor } from 'react-monaco-editor';
import './locales/i18n'; // 取消注释以启用国际化
import { generateDiffHtml, renderHtmlAndGenImageFile } from './tools'

export default function App() {
  const { t, i18n } = useTranslation();
  const [tableMetaList, setTableMetaList] = useState<ITableMeta[]>();
  const [fieldMetaList, setFieldMetaList] = useState<IFieldMeta[]>();
  const [textFieldId, setTextFieldId] = useState<string | null>(null)
  const [textFieldId2, setTextFieldId2] = useState<string | null>(null)
  const [textValue1, setTextValue1] = useState<string | undefined>('')
  const [textValue2, setTextValue2] = useState<string | undefined>('')
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)

  const formApi = useRef<BaseFormApi>();

  // 初始化
  useEffect(() => {
    Promise.all([bitable.base.getTableMetaList(), bitable.base.getSelection(), bitable.base.getActiveTable()])
      .then(async ([metaList, selection, activeTable]) => {
        const { tableId, fieldId } = selection;
        setTableMetaList(metaList);
        const fieldMetaList = await activeTable.getFieldMetaListByType(FieldType.Text)

        setFieldMetaList(fieldMetaList);

        // const fieldMeta = fieldId ? await activeTable.getFieldMetaById(fieldId) : null;
        // const isDateTimeField = fieldMeta?.type === FieldType.DateTime;
        formApi.current?.setValues({
          table: tableId,
          // field: isDateTimeField ? fieldId : null
        });
      });
  }, []);

  // 选区变化重新计划配置
  useEffect(() => {
    const off = bitable.base.onSelectionChange(async (event: { data: Selection }) => {
      const { tableId, recordId } = event.data;

      // 选取变化的时候，更新选中记录 id
      recordId && setSelectedRecordId(recordId);
            
      if (tableId === formApi.current?.getValue('table')) return;
      
      // table 变化了，更新表单配置
      const table = await bitable.base.getActiveTable();
     
      const fieldMetaList = await table.getFieldMetaListByType(FieldType.Text)

      setFieldMetaList(fieldMetaList);
      setTextFieldId(null)
      setTextFieldId2(null)
      // const fieldMeta = fieldId ? await table.getFieldMetaById(fieldId) : null;
      // const isDateTimeField = fieldMeta?.type === FieldType.DateTime;

      formApi.current?.setValues({
        table: tableId,
        textField: null,
        textField2: null,
        // field: isDateTimeField ? fieldId : null
      });
    })

    return () => { off?.() }
  }, [bitable])

  // 当前选区变化或者 field 配置变化都会出发重新计算文本
  useEffect(() => {
    (async () => {
      const table = await bitable.base.getActiveTable();
  
      if (selectedRecordId && textFieldId) {
        const text1 = getTextFieldValue(await table.getCellValue(textFieldId, selectedRecordId) as IOpenSegment[])
  
        setTextValue1(text1)
      }
    })()
  }, [bitable, selectedRecordId, textFieldId])

  // 当前选区变化或者 field2 配置变化都会出发重新计算文本
  useEffect(() => {
    (async () => {
      const table = await bitable.base.getActiveTable();
  
      if (selectedRecordId && textFieldId2) {
        const text2 = getTextFieldValue(await table.getCellValue(textFieldId2, selectedRecordId) as IOpenSegment[])
  
        setTextValue2(text2)
      }
    })()
  }, [bitable, selectedRecordId, textFieldId2])

  

  const getTextFieldValue = (textValue: IOpenSegment[] | null) => {
    return textValue?.reduce((pre, cur) => pre + cur?.text, '') || ''
  }

  // const gen = useCallback(async () => {
  //   const selectedTable = formApi.current?.getValue('table')
  //   const table = await bitable.base.getTableById(selectedTable);
  //   const fieldId = formApi.current?.getValue('textField')
  //   const fieldId2 = formApi.current?.getValue('textField2')
  //   const fieldMetaList = await table.getFieldMetaList()
  //   // const newField = fieldMetaList?.filter(item => item.name === t('diff'))?.[0]
  //   const newFieldId = /*newField?.id || */await table.addField({
  //     type: FieldType.Attachment,
  //     name: t('diff')
  //   })
    
  //   const field1 = await table.getFieldById<ITextField>(fieldId);
  //   const field2 = await table.getFieldById<ITextField>(fieldId2);
  //   const newField = await table.getFieldById<IAttachmentField>(newFieldId);

  //   const fieldName1 = await field1.getName();
  //   const fieldName2 = await field2.getName();
  //   console.log(22222, fieldId, newFieldId)

  //   const records = (await table.getRecords({ pageSize: 5000 })).records
  //   console.log(33333, records)

  //   for (const record of records) {
  //     const val = getTextFieldValue(record.fields[fieldId] as IOpenSegment[])
  //     const val2 = getTextFieldValue(record.fields[fieldId2] as IOpenSegment[])
  //     console.log(666, val, val2)

  //     const diffhtml = generateDiffHtml(fieldName1, fieldName2, val, val2)
      
  //     if (diffhtml.length === 0) continue

  //     const image = await renderHtmlAndGenImageFile(diffhtml);

  //     if (!image) continue;

  //     await newField.setValue(record.recordId, image);
  //   }

  //   /*zconst updatedRecords = */records.forEach(async(record, i) => {
      



  //     // // if (typeof val !== 'number') return null;

  //     // // const xingzuo = genZodiacSign(val, i18n.language)
  //     // return {
  //     //   recordId: record.recordId,
  //     //   fields: {
  //     //     // [newFieldId]: xingzuo,
  //     //   },
  //     // }
  //   })
  //   // .filter(item => !!item) as { recordId: string; fields: { [x: string]: any; }; }[]

  //   // await table.setRecords(
  //   //   updatedRecords
  //   // )
  // }, [bitable])


  return (
    <main className="main">
      <h4>
        {t('title')}
      </h4>
      <br />
      <p>1. {t('step1')}</p>
      <br />
      <p>2. {t('step2')}</p>
      <br />
      <p>3. {t('step3')}</p>
      <br />
      <Form labelPosition='top' getFormApi={(baseFormApi: BaseFormApi) => formApi.current = baseFormApi}>
        <Form.Select field='table' label={t('selectTable')} style={{ width: '100%' }}>
          {
            Array.isArray(tableMetaList) && tableMetaList.map(({ name, id }) => {
              return (
                <Form.Select.Option key={id} value={id}>
                  {name}
                </Form.Select.Option>
              );
            })
          }
        </Form.Select>
        <Form.Select field='textField' label={t('textField')} onChange={setTextFieldId} style={{ width: '100%' }}>
          {
            Array.isArray(fieldMetaList) && fieldMetaList.map(({ name, id }) => {
              return (
                <Form.Select.Option key={id} value={id}>
                  {name}
                </Form.Select.Option>
              );
            })
          }
        </Form.Select>
        <Form.Select field='textField2' label={t('textField2')} onChange={setTextFieldId2} style={{ width: '100%' }}>
          {
            Array.isArray(fieldMetaList) && fieldMetaList.map(({ name, id }) => {
              return (
                <Form.Select.Option key={id} value={id}>
                  {name}
                </Form.Select.Option>
              );
            })
          }
        </Form.Select>
        {/* <Button theme='solid' disabled={!textFieldId || !textFieldId2} htmlType='submit'>{t('genSign')}</Button> */}
      </Form>
      <br />
      {/* <Space>
          <Tag size="small" color='light-blue'>{t('tips')}</Tag>
      </Space> */}
      <br />
      <p>{t('diffResult')}</p>
      <br />
      <div style={{ width: 'auto' }}>
        <MonacoDiffEditor
          width="100%"
          height="600"
          original={textValue1}
          value={textValue2}
          language='txt'
          options={{
            automaticLayout: true,
            readOnly: true,
            renderSideBySide: true,
            useInlineViewWhenSpaceIsLimited: false,
            diffAlgorithm: 'advanced',
            // renderIndicators: false, // 显示差异的指标
            wordWrap: 'off',
            // ignoreTrimWhitespace: false,
            minimap: {
              enabled: false,
            },
          }}
        />
      </div>
    </main>
  )
}
