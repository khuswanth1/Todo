import React, { useState, useEffect } from 'react';
import DownloadIcon from '@mui/icons-material/Download';

export default function BackupSettings({ user, token, theme, isSystemDark, onReset }) {
  const [loading, setLoading] = useState(false);
  const [jspdfLoaded, setJspdfLoaded] = useState(false);
  
  const [duration, setDuration] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const isDark = theme === 'dark' || (theme === 'system' && isSystemDark);

  const filterTasksByDuration = (tasks) => {
    if (duration === "all") return tasks;
    const now = new Date().getTime();
    let startTime = 0, endTime = now;
    if (duration === "1d") startTime = now - 86400000;
    else if (duration === "3d") startTime = now - 259200000;
    else if (duration === "1w") startTime = now - 604800000;
    else if (duration === "1m") startTime = now - 2592000000;
    else if (duration === "3m") startTime = now - 7776000000;
    else if (duration === "6m") startTime = now - 15552000000;
    else if (duration === "1y") startTime = now - 31536000000;
    else if (duration === "custom") {
      startTime = customStart ? new Date(customStart).getTime() : 0;
      endTime = customEnd ? new Date(customEnd).getTime() + 86399999 : now;
    }
    return tasks.filter(t => {
      const tt = new Date(t.createdAt || t.dueTime || Date.now()).getTime();
      return tt >= startTime && tt <= endTime;
    });
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return null;
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    if (diffMs < 0) return "0h 0m";
    const h = Math.floor(diffMs / 3600000);
    const m = Math.floor((diffMs % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  useEffect(() => {
    const loadScripts = async () => {
      try {
        if (!window.html2canvas) {
          await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
            s.onload = res; s.onerror = rej; document.head.appendChild(s);
          });
        }
        if (!window.jspdf) {
          await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
            s.onload = res; s.onerror = rej; document.head.appendChild(s);
          });
        }
        if (!window.jspdf.jsPDF.API.autoTable) {
          await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js";
            s.onload = res; s.onerror = rej; document.head.appendChild(s);
          });
        }
        setJspdfLoaded(true);
      } catch (err) { console.error("Failed to load export libs", err); }
    };
    loadScripts();
  }, []);

  const handleExportPDF = async () => {
    if (!jspdfLoaded) { alert("PDF libraries are still loading."); return; }
    setLoading(true);
    try {
      const res = await fetch(`/tasks${user?.id ? `?userId=${user.id}` : ''}`, {
        headers: { Authorization: "Bearer " + token }
      });
      if (!res.ok) { alert("Failed to fetch tasks."); setLoading(false); return; }

      let tasks = await res.json();
      tasks = filterTasksByDuration(tasks);

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');

      // Draw Top Premium Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 36, 'F');

      // Add accent line
      doc.setFillColor(79, 70, 229); // indigo-600
      doc.rect(0, 36, 210, 2, 'F');

      // Title & Subtitle in Banner
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("Helvetica", "bold");
      doc.text("Task Backup Report", 14, 18);

      doc.setFontSize(9);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(156, 163, 175); // slate-400
      doc.text(`${user?.name || 'User'} • Generated: ${new Date().toLocaleString()}`, 14, 26);

      let startY = 46;

      // Group tasks
      const parents = tasks.filter(t => !t.parentTaskId);
      const subMap = {};
      tasks.filter(t => t.parentTaskId).forEach(s => {
        if (!subMap[s.parentTaskId]) subMap[s.parentTaskId] = [];
        subMap[s.parentTaskId].push(s);
      });

      parents.forEach((task, i) => {
        if (startY > 250) {
          doc.addPage();
          startY = 20;
        }

        const createdAt = task.createdAt || Date.now();
        const completedAt = task.completedAt || null;
        const durationStr = formatDuration(createdAt, completedAt);

        let formattedStatus = 'Pending';
        if (task.status === 'DONE') formattedStatus = 'Completed';
        else if (task.status === 'IN_PROGRESS') formattedStatus = 'In Progress';

        // Always show status as requested by the user
        const showStatus = true;
        const showDuration = durationStr && durationStr !== 'Ongoing' && durationStr !== '0h 0m';

        // Priority colors
        let prioColor = [100, 116, 139];
        let prioBg = [248, 250, 252];
        if (task.priority === 'High') {
          prioColor = [185, 28, 28]; // red-700
          prioBg = [254, 242, 242]; // red-50
        } else if (task.priority === 'Medium') {
          prioColor = [194, 65, 12]; // orange-700
          prioBg = [255, 247, 237]; // orange-50
        } else if (task.priority === 'Low') {
          prioColor = [59, 130, 246]; // blue-500
          prioBg = [239, 246, 255]; // blue-50
        }

        // Status colors
        let statusColor = [100, 116, 139];
        let statusBg = [248, 250, 252];
        if (task.status === 'DONE') {
          statusColor = [4, 120, 87]; // green-700
          statusBg = [236, 253, 245]; // green-50
        } else if (task.status === 'IN_PROGRESS') {
          statusColor = [180, 83, 9]; // amber-700
          statusBg = [255, 251, 235]; // amber-50
        }

        let bodyRows = [
          // Premium Indigo Header Bar for Task Title
          [{ 
            content: `  ${i + 1}. ${task.title}`, 
            styles: { fontStyle: 'bold', fontSize: 10.5, textColor: [255, 255, 255], fillColor: [79, 70, 229], cellPadding: 5.5 }, 
            colSpan: 2 
          }],
          [
            { content: `Priority: ${task.priority || "Medium"}`, styles: { textColor: prioColor, fillColor: prioBg, fontStyle: 'bold' } },
            { content: `Status: ${formattedStatus}`, styles: { textColor: statusColor, fillColor: statusBg, fontStyle: 'bold' } }
          ],
          [
            `Due: ${task.dueTime ? new Date(task.dueTime).toLocaleString() : 'None'}`, 
            showDuration ? `Duration: ${durationStr}` : ''
          ],
          [{ content: `Description: ${task.description || 'None'}`, colSpan: 2 }]
        ];

        // Filter empty rows
        bodyRows = bodyRows.filter(row => {
          if (Array.isArray(row)) {
            return row.some(cell => cell !== '');
          }
          return row !== '';
        });

        const subs = subMap[task.id] || [];
        if (subs.length > 0) {
          // Objectives (Subtasks) Header row
          bodyRows.push([{ 
            content: 'Objectives (Subtasks)', 
            styles: { fontStyle: 'bold', fontSize: 9, textColor: [79, 70, 229], fillColor: [243, 244, 246], cellPadding: { left: 12, top: 4, bottom: 4 } }, 
            colSpan: 2 
          }]);

          subs.forEach(sub => {
            const subCreatedAt = sub.createdAt || Date.now();
            const subCompletedAt = sub.completedAt || null;
            const subDuration = formatDuration(subCreatedAt, subCompletedAt);

            let subStatus = 'Pending';
            if (sub.status === 'DONE') subStatus = 'Completed';
            else if (sub.status === 'IN_PROGRESS') subStatus = 'In Progress';

            const showSubStatus = true;
            const showSubDuration = subDuration && subDuration !== 'Ongoing' && subDuration !== '0h 0m';

            // Subtask status colors
            let subStatusColor = [100, 116, 139];
            let subStatusBg = [248, 250, 252];
            if (sub.status === 'DONE') {
              subStatusColor = [4, 120, 87];
              subStatusBg = [236, 253, 245];
            } else if (sub.status === 'IN_PROGRESS') {
              subStatusColor = [180, 83, 9];
              subStatusBg = [255, 251, 235];
            }

            bodyRows.push([{ 
              content: `• ${sub.title}`, 
              styles: { fontStyle: 'bold', textColor: [31, 41, 55], cellPadding: { left: 14, top: 3, bottom: 1.5 } }, 
              colSpan: 2 
            }]);
            bodyRows.push([
              { content: `Priority: ${sub.priority || "Low"}`, styles: { cellPadding: { left: 14, top: 1.5, bottom: 1.5 } } }, 
              { content: `Status: ${subStatus}`, styles: { textColor: subStatusColor, fillColor: subStatusBg, fontStyle: 'bold', cellPadding: { left: 4, top: 1.5, bottom: 1.5 } } }
            ]);
            if (showSubDuration || sub.dueTime) {
              bodyRows.push([
                { content: `Due: ${sub.dueTime ? new Date(sub.dueTime).toLocaleString() : 'None'}`, styles: { cellPadding: { left: 14, top: 1.5, bottom: 1.5 } } },
                showSubDuration ? { content: `Duration: ${subDuration}`, styles: { cellPadding: { left: 4, top: 1.5, bottom: 1.5 } } } : ''
              ]);
            }
            if (sub.description) {
              bodyRows.push([{ 
                content: `Description: ${sub.description}`, 
                styles: { cellPadding: { left: 14, top: 1.5, bottom: 3 } },
                colSpan: 2 
              }]);
            }
          });
        }

        doc.autoTable({
          startY: startY,
          head: [],
          body: bodyRows,
          theme: 'plain',
          styles: { fontSize: 8.5, cellPadding: 3.5, textColor: [71, 85, 105] },
          margin: { left: 14, right: 14 },
          tableLineColor: [229, 231, 235],
          tableLineWidth: 0.5,
          pageBreak: 'avoid'
        });

        startY = doc.lastAutoTable.finalY + 8;
      });

      doc.save(`todo_backup_${Date.now()}.pdf`);
    } catch (err) { console.error(err); alert("Error generating PDF."); }
    finally { setLoading(false); }
  };
  const [resetLoading, setResetLoading] = useState(false);

  const handleResetData = async () => {
    if (!user?.id) return;

    setResetLoading(true);
    try {
      const res = await fetch(`/tasks/clear?userId=${user.id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token
        }
      });
      if (res.ok) {
        if (onReset) onReset();
      } else {
        alert("Failed to clear data from server.");
      }
    } catch (err) {
      console.error("Clear data error:", err);
      alert("Error occurred while clearing data.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className={`text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Backup & Reset Data</h3>
        <p className="text-slate-500 text-sm font-medium mb-6">Download a professionally formatted PDF copy of your missions, or reset your workspace.</p>
      <div className="space-y-4">
        {/* PDF Export Card */}
        <div className={`relative p-6 rounded-2xl border flex flex-col md:flex-row gap-6 items-start md:items-center justify-between ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-start gap-4 flex-1">
            <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
              <DownloadIcon />
            </div>
            <div>
              <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Export as PDF</h4>
              <p className="text-xs text-slate-500 font-medium mt-1 mb-4">Professional report with summary dashboard, task cards, and nested subtasks.</p>
              <div className="flex flex-wrap items-center gap-3">
                <select value={duration} onChange={(e) => setDuration(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border outline-none cursor-pointer transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                  <option value="all">All Time</option>
                  <option value="1d">Last 1 Day</option>
                  <option value="3d">Last 3 Days</option>
                  <option value="1w">Last 1 Week</option>
                  <option value="1m">Last 1 Month</option>
                  <option value="3m">Last 3 Months</option>
                  <option value="6m">Last 6 Months</option>
                  <option value="1y">Last 1 Year</option>
                  <option value="custom">Custom Duration</option>
                </select>
                {duration === "custom" && (
                  <div className={`flex items-center gap-2 p-1.5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold outline-none cursor-pointer bg-transparent ${isDark ? 'text-slate-300' : 'text-slate-700'}`} />
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-1">to</span>
                    <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold outline-none cursor-pointer bg-transparent ${isDark ? 'text-slate-300' : 'text-slate-700'}`} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="relative">
            <button onClick={handleExportPDF} disabled={loading || !jspdfLoaded}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all shadow-sm ${loading || !jspdfLoaded ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95'}`}>
              {loading ? 'Generating...' : <><DownloadIcon sx={{ fontSize: 18 }} /> Download PDF</>}
            </button>
          </div>
        </div>

        {/* Reset Data Card */}
        <div className={`relative p-6 rounded-2xl border flex flex-col md:flex-row gap-6 items-start md:items-center justify-between ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-start gap-4 flex-1">
            <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <div>
              <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Reset All Data</h4>
              <p className="text-xs text-slate-500 font-medium mt-1 mb-2">Completely clear all tasks and objectives from the database. This action is irreversible.</p>
            </div>
          </div>
          <div className="relative">
            <button onClick={handleResetData} disabled={resetLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all shadow-sm ${resetLoading ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-500' : 'bg-rose-600 text-white hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-500/30 active:scale-95'}`}>
              {resetLoading ? 'Clearing...' : 'Clear All Data'}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
