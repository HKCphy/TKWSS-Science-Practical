import React, { useState } from 'react';
import { 
  Users, 
  Save, 
  Trash2, 
  RefreshCw, 
  GraduationCap, 
  ClipboardList, 
  FileSpreadsheet, 
  Info,
  Check,
  X,
  Plus,
  Minus
} from 'lucide-react';

export default function App() {
  // 評分準則清單
  const scoringCriteria = [
    { id: 'q1', category: '裝置', num: '1', detail: '玻璃塊的直邊放於量角器的 90°– 90° 線上' },
    { id: 'q2', category: '裝置', num: '2', detail: '玻璃塊直邊的中心與量角器的中心點重疊' },
    { id: 'q3', category: '裝置', num: '3', detail: '狹縫板選用「單縫」，並放於合適距離使光束變幼' },
    { id: 'q4', category: '過程', num: '4', detail: '光線由玻璃塊的「曲面進入」，射向玻璃塊的中心' },
    { id: 'q5', category: '過程', num: '5', detail: '找臨界角的方法正確 (老師檢查時評分)' },
    { id: 'q6', category: '完成', num: '6', detail: '折射角數值正確 (A / B / C)' },
    { id: 'q7', category: '完成', num: '7', detail: '臨界角數值正確' },
    { id: 'q8', category: '完成', num: '8', detail: '圈出正確答案 (折射線是 90°)' },
    { id: 'q9', category: '完成', num: '9', detail: '單位正確 (全對：1分 / 部分錯漏或無單位：0分)' },
    { id: 'q10', category: '完成', num: '10', detail: '考試時間內清理及還原實驗儀器' },
  ];

  // 班級選項
  const grades = ['中一 (S1)', '中二 (S2)', '中三 (S3)'];
  const classes = ['A', 'B', 'C', 'D'];
  
  // 生成學號列表 01 - 45
  const studentNumbers = Array.from({ length: 45 }, (_, i) => {
    const num = i + 1;
    return num < 10 ? `0${num}` : `${num}`;
  });

  // 狀態：目前選擇的班級、老師、日期
  const [selectedGrade, setSelectedGrade] = useState('中三 (S3)');
  const [selectedClass, setSelectedClass] = useState('A');
  const [evaluator, setEvaluator] = useState('');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);

  // 初始化單一學生的評分資料結構
  const createEmptyStudentScore = (index) => ({
    key: index,
    studentId: '', // 學號 (下拉選單 01-45)
    scores: {
      q1: 0, q2: 0, q3: 0, q4: 0, q5: 0,
      q6: 0, q7: 0, q8: 0, q9: 0, q10: 0
    },
    deduction: 0, // 其他扣分項目 (扣 0.5/1/1.5 等)
  });

  // 狀態：目前正在評分的 5 位學生
  const [currentStudents, setCurrentStudents] = useState([
    createEmptyStudentScore(0),
    createEmptyStudentScore(1),
    createEmptyStudentScore(2),
    createEmptyStudentScore(3),
    createEmptyStudentScore(4),
  ]);

  // 狀態：已儲存的歷史紀錄 (全班成績)
  const [savedRecords, setSavedRecords] = useState([]);
  
  // 提示訊息狀態
  const [alertMessage, setAlertMessage] = useState(null);

  // 顯示提示訊息的輔助函數
  const showAlert = (text, type = 'success') => {
    setAlertMessage({ text, type });
    setTimeout(() => {
      setAlertMessage(null);
    }, 4000);
  };

  // 計算特定學生的總分
  const calculateTotalScore = (student) => {
    const sumOfCriteria = Object.values(student.scores).reduce((a, b) => a + b, 0);
    const finalScore = sumOfCriteria - student.deduction;
    return Math.max(0, finalScore); // 總分不小於0
  };

  // 更新特定學生的學號
  const handleStudentIdChange = (index, value) => {
    const updated = [...currentStudents];
    updated[index].studentId = value;
    setCurrentStudents(updated);
  };

  // 更新特定學生某項準則的分數 (0 或 1)
  const handleScoreChange = (studentIndex, criteriaId, val) => {
    const updated = [...currentStudents];
    updated[studentIndex].scores[criteriaId] = val;
    setCurrentStudents(updated);
  };

  // 快速加/減扣分 (以 0.5 為單位)
  const adjustDeduction = (studentIndex, amount) => {
    const updated = [...currentStudents];
    const currentDeduction = updated[studentIndex].deduction;
    updated[studentIndex].deduction = Math.max(0, currentDeduction + amount);
    setCurrentStudents(updated);
  };

  // 快速全選/全不選某位學生的分數
  const setAllScoresForStudent = (studentIndex, value) => {
    const updated = [...currentStudents];
    Object.keys(updated[studentIndex].scores).forEach(key => {
      updated[studentIndex].scores[key] = value;
    });
    setCurrentStudents(updated);
  };

  // 清空目前的評分面板
  const clearRatingBoard = () => {
    if (window.confirm("確定要清空目前5位學生的評分面板嗎？已儲存的歷史成績不會被刪除。")) {
      setCurrentStudents([
        createEmptyStudentScore(0),
        createEmptyStudentScore(1),
        createEmptyStudentScore(2),
        createEmptyStudentScore(3),
        createEmptyStudentScore(4),
      ]);
      showAlert("已成功重設評分面板！", "info");
    }
  };

  // 儲存本次實驗成績 (5位學生)
  const saveCurrentBatch = () => {
    const activeStudents = currentStudents.filter(s => s.studentId !== '');
    if (activeStudents.length === 0) {
      showAlert("儲存失敗：請至少選擇一位學生的學號！", "error");
      return;
    }

    // 檢查是否有學號重複
    const ids = activeStudents.map(s => s.studentId);
    const hasDuplicate = ids.some((val, i) => ids.indexOf(val) !== i);
    if (hasDuplicate) {
      showAlert("儲存失敗：本批次中含有重複的學號，請檢查！", "error");
      return;
    }

    const newRecords = activeStudents.map(student => {
      const criteriaScores = { ...student.scores };
      const total = calculateTotalScore(student);
      return {
        id: `${selectedGrade}-${selectedClass}-${student.studentId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        grade: selectedGrade,
        className: selectedClass,
        studentId: student.studentId,
        scores: criteriaScores,
        deduction: student.deduction,
        totalScore: total,
        evaluator: evaluator || '未填寫',
        date: examDate
      };
    });

    // 檢查與歷史紀錄是否重複
    const duplicatesInSaved = newRecords.filter(nr => 
      savedRecords.some(sr => sr.grade === nr.grade && sr.className === nr.className && sr.studentId === nr.studentId)
    );

    if (duplicatesInSaved.length > 0) {
      const duplicateIds = duplicatesInSaved.map(d => `學號 ${d.studentId}`).join(', ');
      if (!window.confirm(`提示：${duplicateIds} 的成績已在記錄中存在。確定要覆蓋或新增重複數據嗎？`)) {
        return;
      }
    }

    setSavedRecords(prev => [...prev, ...newRecords]);
    showAlert(`成功儲存 ${newRecords.length} 位學生的成績！`, "success");

    // 自動清空評分板，保留基本設定，準備下一批
    setCurrentStudents([
      createEmptyStudentScore(0),
      createEmptyStudentScore(1),
      createEmptyStudentScore(2),
      createEmptyStudentScore(3),
      createEmptyStudentScore(4),
    ]);
  };

  // 刪除特定單筆歷史紀錄
  const deleteRecord = (recordId) => {
    if (window.confirm("確定要刪除這筆成績紀錄嗎？")) {
      setSavedRecords(prev => prev.filter(r => r.id !== recordId));
      showAlert("已刪除該筆紀錄。", "info");
    }
  };

  // 清空所有歷史紀錄
  const clearAllSavedRecords = () => {
    if (window.confirm("⚠️ 警告：確定要清空所有已儲存的歷史成績嗎？此動作無法復原！")) {
      setSavedRecords([]);
      showAlert("所有歷史紀錄已清空。", "info");
    }
  };

  // 匯出 CSV 格式 (Excel 相容 + BOM 避免中文亂碼)
  const exportToExcel = () => {
    if (savedRecords.length === 0) {
      showAlert("沒有已儲存的紀錄可供匯出！", "error");
      return;
    }

    let csvContent = '\uFEFF'; // UTF-8 BOM
    const headers = [
      '日期', '評核老師', '年級', '班別', '學號',
      ...scoringCriteria.map(c => `[${c.category}] Q${c.num}.${c.detail}`),
      '其他扣分', '總分(滿分10)'
    ];
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';

    savedRecords.forEach(record => {
      const row = [
        record.date,
        record.evaluator,
        record.grade,
        record.className,
        record.studentId,
        ...scoringCriteria.map(c => record.scores[c.id]),
        record.deduction,
        record.totalScore
      ];
      csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedGrade}_${selectedClass}班_科學實驗成績_${examDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showAlert("成績 CSV 匯出成功！已下載至您的裝置。", "success");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-12">
      {/* 頂部標題 */}
      <header className="bg-slate-900 text-white shadow-md py-3.5 px-6 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-1.5 rounded text-white shadow">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">科學實驗試 — 即時表格計分平台</h1>
              <p className="text-[11px] text-slate-400">專為快速評估5位學生而設的橫向矩陣面板</p>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1 text-xs">
            <span className="text-slate-400">當前實驗：</span>
            <span className="text-blue-400 font-semibold">折射與臨界角 (Refraction & Critical Angle)</span>
          </div>
        </div>
      </header>

      {/* 提示訊息 */}
      {alertMessage && (
        <div className="fixed top-16 right-4 z-50 animate-fade-in">
          <div className={`shadow-xl rounded-lg p-3.5 flex items-center gap-2.5 text-xs font-semibold border ${
            alertMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
            alertMessage.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            <span>{alertMessage.text}</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 space-y-4">
        
        {/* 第一部分：基本考務設定 (精簡版) */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">年級</label>
              <select 
                value={selectedGrade} 
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full rounded border-slate-200 border p-1.5 bg-white text-slate-800 focus:ring-1 focus:ring-blue-500 text-xs"
              >
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">班別</label>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded border-slate-200 border p-1.5 bg-white text-slate-800 focus:ring-1 focus:ring-blue-500 text-xs"
              >
                {classes.map(c => <option key={c} value={c}>{c} 班</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">評核老師</label>
              <input 
                type="text" 
                value={evaluator}
                onChange={(e) => setEvaluator(e.target.value)}
                placeholder="輸入教師姓名" 
                className="w-full rounded border-slate-200 border p-1.5 text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">評核日期</label>
              <input 
                type="date" 
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full rounded border-slate-200 border p-1.5 text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* 第二部分：橫向矩陣計分表格 */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* 表格頂部控制列 */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Users className="h-4.5 w-4.5 text-blue-600" />
              <span className="font-bold text-slate-800 text-sm">實驗評分網格 (同時處理 5 位學員)</span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={clearRatingBoard}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50"
              >
                <RefreshCw className="h-3 w-3" />
                重設面板
              </button>
              <button
                onClick={saveCurrentBatch}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm"
              >
                <Save className="h-3 w-3" />
                儲存本組 (5人)
              </button>
            </div>
          </div>

          {/* 表格主體 */}
          <div className="overflow-x-auto">
            <table className="w-full table-fixed min-w-[900px] border-collapse">
              <thead>
                {/* 學生學號選擇與一鍵操作列 */}
                <tr className="bg-slate-100 border-b border-slate-200">
                  {/* 第一欄：題目 */}
                  <th className="w-[30%] p-3 text-left font-bold text-slate-600 text-xs">
                    評分項目與準則
                  </th>
                  
                  {/* 5位學生的欄標題 */}
                  {currentStudents.map((student, sIdx) => (
                    <th 
                      key={student.key} 
                      className={`w-[14%] p-3 text-center border-l border-slate-200 transition-colors ${
                        student.studentId ? 'bg-blue-50/50' : 'bg-slate-100'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold text-slate-500">學生 {sIdx + 1}</div>
                        
                        {/* 學號選單 */}
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-[10px] text-slate-400 font-bold">學號:</span>
                          <select
                            value={student.studentId}
                            onChange={(e) => handleStudentIdChange(sIdx, e.target.value)}
                            className="text-xs font-bold rounded border border-slate-300 px-1 py-0.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">--</option>
                            {studentNumbers.map(num => (
                              <option key={num} value={num}>{num} 號</option>
                            ))}
                          </select>
                        </div>

                        {/* 一鍵設置分數 */}
                        {student.studentId && (
                          <div className="flex justify-center gap-1 text-[9px] pt-1">
                            <button 
                              onClick={() => setAllScoresForStudent(sIdx, 1)}
                              className="bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 px-1 rounded transition font-semibold"
                            >
                              全對
                            </button>
                            <button 
                              onClick={() => setAllScoresForStudent(sIdx, 0)}
                              className="bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 px-1 rounded transition font-semibold"
                            >
                              全錯
                            </button>
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100">
                {/* 10項考核指標列 */}
                {scoringCriteria.map((criterion, cIdx) => (
                  <tr key={criterion.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* 指標詳情 */}
                    <td className="p-2.5 text-xs">
                      <div className="flex items-start gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 ${
                          criterion.category === '裝置' ? 'bg-purple-100 text-purple-800' :
                          criterion.category === '過程' ? 'bg-amber-100 text-amber-800' :
                          'bg-indigo-100 text-indigo-800'
                        }`}>
                          {criterion.category} Q{criterion.num}
                        </span>
                        <p className="text-slate-700 font-medium leading-normal">{criterion.detail}</p>
                      </div>
                    </td>

                    {/* 5位學生的 0/1 評分按鈕 */}
                    {currentStudents.map((student, sIdx) => {
                      const isSelected0 = student.scores[criterion.id] === 0;
                      const isSelected1 = student.scores[criterion.id] === 1;
                      const hasId = student.studentId !== '';
                      
                      return (
                        <td 
                          key={student.key} 
                          className={`p-2 border-l border-slate-200 text-center transition-colors ${
                            hasId ? 'bg-blue-50/10' : 'bg-slate-50/30'
                          }`}
                        >
                          <div className="flex justify-center items-center gap-1.5">
                            {/* 0 分按鈕 */}
                            <button
                              type="button"
                              disabled={!hasId}
                              onClick={() => handleScoreChange(sIdx, criterion.id, 0)}
                              className={`w-10 py-1 rounded text-xs font-bold border transition ${
                                !hasId 
                                  ? 'bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed'
                                  : isSelected0
                                    ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              0
                            </button>
                            
                            {/* 1 分按鈕 */}
                            <button
                              type="button"
                              disabled={!hasId}
                              onClick={() => handleScoreChange(sIdx, criterion.id, 1)}
                              className={`w-10 py-1 rounded text-xs font-bold border transition ${
                                !hasId 
                                  ? 'bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed'
                                  : isSelected1
                                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              1
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* 扣分項目 Row (不安全/粗暴操作) */}
                <tr className="bg-amber-50/30">
                  <td className="p-2.5 text-xs">
                    <div className="flex items-start gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 bg-amber-200 text-amber-900">
                        其他扣分
                      </span>
                      <div>
                        <p className="font-bold text-amber-900">不安全或粗暴操作儀器扣分</p>
                        <p className="text-[10px] text-slate-500">忽略儀器安全/態度欠佳/不小心或故意損壞 (每項扣 0.5 分)</p>
                      </div>
                    </div>
                  </td>

                  {/* 5位學生的扣分器 */}
                  {currentStudents.map((student, sIdx) => {
                    const hasId = student.studentId !== '';
                    return (
                      <td key={student.key} className="p-2 border-l border-slate-200 text-center">
                        {hasId ? (
                          <div className="flex items-center justify-center gap-1 max-w-[110px] mx-auto">
                            <button
                              type="button"
                              onClick={() => adjustDeduction(sIdx, -0.5)}
                              disabled={student.deduction <= 0}
                              className="p-1 bg-white border border-slate-300 text-slate-600 rounded hover:bg-slate-50 disabled:opacity-30"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            
                            <span className="text-xs font-bold text-amber-700 min-w-[28px]">
                              -{student.deduction}
                            </span>

                            <button
                              type="button"
                              onClick={() => adjustDeduction(sIdx, 0.5)}
                              className="p-1 bg-white border border-slate-300 text-slate-600 rounded hover:bg-slate-50"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 總得分展示 Row */}
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                  <td className="p-3 text-right text-xs text-slate-600">
                    即時計算總分 (滿分 10 分)：
                  </td>
                  
                  {/* 5位學生的總分 */}
                  {currentStudents.map((student, sIdx) => {
                    const hasId = student.studentId !== '';
                    const total = calculateTotalScore(student);
                    return (
                      <td key={student.key} className="p-3 border-l border-slate-200 text-center">
                        {hasId ? (
                          <div className="text-base font-black">
                            <span className={total >= 6 ? 'text-emerald-600' : 'text-slate-800'}>
                              {total}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold ml-0.5">/10</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* 表格底部快速確認列 */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={saveCurrentBatch}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors"
            >
              <Save className="h-4 w-4" />
              儲存本組 5 位學生實驗成績
            </button>
          </div>
        </section>

        {/* 第三部分：歷史成績總表 (全班成績) */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
            <div className="border-l-4 border-emerald-600 pl-2.5">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4 text-emerald-600" />
                3. 本班已儲存歷史成績記錄 ({savedRecords.length} 筆)
              </h2>
              <p className="text-[11px] text-slate-500">
                可隨時按「匯出 Excel (CSV)」導出檔案，以便進行學校登記。
              </p>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={clearAllSavedRecords}
                disabled={savedRecords.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-white border border-rose-200 rounded hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-3 w-3" />
                清空本班
              </button>
              
              <button
                onClick={exportToExcel}
                disabled={savedRecords.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                匯出 Excel (CSV)
              </button>
            </div>
          </div>

          {/* 表格 */}
          {savedRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <ClipboardList className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold">尚未有任何暫存記錄。</p>
              <p className="text-[10px] text-slate-400 mt-0.5">點擊上方的「儲存本組 (5人)」即可累積歷史成績。</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3 text-center">年級</th>
                    <th className="py-2.5 px-3 text-center">班別</th>
                    <th className="py-2.5 px-3 text-center">學號</th>
                    <th className="py-2.5 px-2 text-center">10大細項指標得分狀況</th>
                    <th className="py-2.5 px-3 text-center">扣分</th>
                    <th className="py-2.5 px-3 text-center font-bold text-blue-800">總得分</th>
                    <th className="py-2.5 px-3 text-center">評分教師</th>
                    <th className="py-2.5 px-3 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {savedRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 text-center">{record.grade}</td>
                      <td className="py-2 px-3 text-center font-bold text-slate-700">{record.className}班</td>
                      <td className="py-2 px-3 text-center">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold text-xs">
                          {record.studentId} 號
                        </span>
                      </td>
                      {/* 展示 10 項指標 */}
                      <td className="py-2 px-2">
                        <div className="flex justify-center gap-0.5">
                          {scoringCriteria.map(c => {
                            const score = record.scores[c.id];
                            return (
                              <span 
                                key={c.id} 
                                className={`w-4 h-4 text-[9px] flex items-center justify-center rounded font-bold ${
                                  score === 1 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                                title={`Q${c.num}.${c.detail}: ${score}分`}
                              >
                                {score}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center text-amber-600 font-medium">
                        {record.deduction > 0 ? `-${record.deduction}` : '0'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-black text-xs ${
                          record.totalScore >= 6 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {record.totalScore} / 10
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center text-slate-500">{record.evaluator}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => deleteRecord(record.id)}
                          className="text-slate-400 hover:text-rose-600 transition p-1"
                          title="刪除"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 底部使用指引 */}
        <section className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900/95 flex items-start gap-2">
          <Info className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-blue-950">老師的操作秘笈：</span>
            <p>1. <strong>快速批改全班</strong>：如果大部分學生表現完美，您可以先在學生學號下方點擊「<strong>全對</strong>」，系統會瞬間將該學生的 10 個項目全部填為 1 分（即 10分滿分），您再針對個別失误手動改成 0 分即可！</p>
            <p>2. <strong>直觀易用</strong>：每完成 5 位學生的實驗，直接點擊「<strong>儲存本組</strong>」儲存到下方列表，網格會自動重設，方便您立即對下 5 位學生進行評分。</p>
          </div>
        </section>

      </main>
    </div>
  );
}