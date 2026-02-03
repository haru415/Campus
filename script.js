let subjects = JSON.parse(localStorage.getItem('campus-subjects-v2')) || [];
let currentDay = '月';

const timetable = document.getElementById('timetable');
const nameInput = document.getElementById('subject-name');
const roomInput = document.getElementById('room-name');

// 曜日切り替え
window.changeDay = (day) => {
    currentDay = day;
    document.getElementById('current-day-display').innerText = `${day}曜日の講義`;
    document.querySelectorAll('.day-tabs button').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === day);
    });
    render();
};

function render() {
    timetable.innerHTML = '';
    const filtered = subjects.filter(s => s.day === currentDay);

    filtered.forEach((sub) => {
        const maxAbsent = 3;
        const remaining = maxAbsent - sub.absent;
        
        // 危険度の判定
        let statusClass = 'border-safe';
        let alertMsg = `あと ${remaining} 回休めます`;
        if (remaining === 1) {
            statusClass = 'border-warning';
            alertMsg = `【注意】あと 1 回しか休めません！`;
        } else if (remaining <= 0) {
            statusClass = 'border-danger';
            alertMsg = `【危険】単位取得が厳しい状態です`;
        }

        const card = document.createElement('div');
        card.className = `card ${statusClass}`;
        card.innerHTML = `
            <h3>${sub.name} <small style="color:#999; font-size:0.6em;">@${sub.room}</small></h3>
            
            <div style="display: flex; gap: 15px; margin-bottom: 5px; font-size: 0.9em;">
                <span style="color: var(--safe); font-weight: bold;">出席: ${sub.present || 0} 回</span>
                <span style="color: var(--danger); font-weight: bold;">欠席: ${sub.absent} 回</span>
            </div>
            
            <p class="alert-text" style="color: ${remaining <= 0 ? 'red' : '#333'}">${alertMsg}</p>
            
            <div class="btn-group" style="display: flex; gap: 10px;">
                <button class="present-btn" onclick="updateAttendance('${sub.id}', 'present')" style="flex:1; padding: 10px; background: #E1F5FE; border: 1px solid #007AFF; border-radius: 8px; color: #007AFF;">出席を記録</button>
                <button class="absent-btn" onclick="updateAttendance('${sub.id}', 'absent')" style="flex:1; padding: 10px; background: #FFEBEE; border: 1px solid #FF3B30; border-radius: 8px; color: #FF3B30;">欠席を記録</button>
            </div>

            <div class="memo-area">
                <strong>メモ:</strong><br>
                <span contenteditable="true" onblur="updateMemo('${sub.id}', this.innerText)">${sub.memo || ''}</span>
            </div>
            <button class="delete-btn" onclick="deleteSubject('${sub.id}')" style="margin-top:10px; font-size:10px; color:#ccc; border:none; background:none; cursor:pointer; width:100%; text-align:right;">講義を削除</button>
        `;
        timetable.appendChild(card);
    });
    
    localStorage.setItem('campus-subjects-v2', JSON.stringify(subjects));
}

// 追加機能
document.getElementById('add-btn').onclick = () => {
    const name = nameInput.value.trim();
    if (!name) return;
    
    const newSub = {
        id: Date.now().toString(),
        name: name,
        room: roomInput.value || '未定',
        day: currentDay,
        present: 0, // 初期値を追加
        absent: 0,
        memo: ''
    };
    
    subjects.push(newSub);
    nameInput.value = '';
    roomInput.value = '';
    render();
};

// 出席・欠席更新
window.updateAttendance = (id, type) => {
    const sub = subjects.find(s => s.id === id);
    if (type === 'present') {
        sub.present = (sub.present || 0) + 1;
    } else if (type === 'absent') {
        sub.absent++;
    }
    render();
};

// メモ更新
window.updateMemo = (id, text) => {
    const sub = subjects.find(s => s.id === id);
    if(sub) sub.memo = text;
    localStorage.setItem('campus-subjects-v2', JSON.stringify(subjects));
};

// 削除
window.deleteSubject = (id) => {
    if (confirm('この講義を削除しますか？')) {
        subjects = subjects.filter(s => s.id !== id);
        render();
    }
};

changeDay('月');
