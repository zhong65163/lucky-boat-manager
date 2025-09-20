// 账号管理系统前端脚本
class AccountManager {
    constructor() {
        this.baseUrl = '/api';
        this.accounts = [];
        this.filteredAccounts = [];
        this.init();
    }

    async init() {
        console.log('🚀 初始化账号管理系统...');
        
        // 绑定事件
        this.bindEvents();
        
        // 加载初始数据
        await this.loadData();
        
        console.log('✅ 系统初始化完成');
    }

    bindEvents() {
        // 搜索功能
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterAccounts(e.target.value);
            });
        }

        // 表单提交
        const addForm = document.getElementById('addForm');
        if (addForm) {
            addForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addAccount();
            });
        }

        // 模态框外部点击关闭
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('addModal');
            if (e.target === modal) {
                this.closeAddModal();
            }
        });

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAddModal();
            }
        });
    }

    async loadData() {
        try {
            this.showLoading(true);
            
            // 并发加载统计信息和账号列表
            const [statsResponse, accountsResponse] = await Promise.all([
                fetch(`${this.baseUrl}/statistics`),
                fetch(`${this.baseUrl}/accounts`)
            ]);

            if (!statsResponse.ok || !accountsResponse.ok) {
                throw new Error('加载数据失败');
            }

            const statsData = await statsResponse.json();
            const accountsData = await accountsResponse.json();

            if (statsData.status === 'success') {
                this.updateStatistics(statsData.data);
            }

            if (accountsData.status === 'success') {
                this.accounts = accountsData.data;
                this.filteredAccounts = [...this.accounts];
                this.renderAccountsTable();
            }

        } catch (error) {
            console.error('加载数据失败:', error);
            this.showError('加载数据失败，请刷新页面重试');
        } finally {
            this.showLoading(false);
        }
    }

    updateStatistics(stats) {
        const elements = {
            totalAccounts: stats.total_accounts || 0,
            activeAccounts: stats.active_accounts || 0,
            disabledAccounts: stats.disabled_accounts || 0,
            recentAccounts: stats.recent_created || 0
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                // 数字动画效果
                this.animateNumber(element, value);
            }
        });
    }

    animateNumber(element, targetValue) {
        const startValue = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    renderAccountsTable() {
        const tbody = document.getElementById('accountsTableBody');
        const emptyState = document.getElementById('emptyState');
        const table = document.getElementById('accountsTable');

        if (!tbody) return;

        if (this.filteredAccounts.length === 0) {
            table.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        table.style.display = 'table';
        emptyState.style.display = 'none';

        tbody.innerHTML = this.filteredAccounts.map(account => `
            <tr>
                <td>
                    <strong>${this.escapeHtml(account.username)}</strong>
                </td>
                <td>${this.escapeHtml(account.display_name || '-')}</td>
                <td>
                    <span class="permission-badge permission-${account.permission_level}">
                        ${this.getPermissionText(account.permission_level)}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${account.status === 1 ? 'status-active' : 'status-disabled'}">
                        ${account.status === 1 ? '✅ 激活' : '❌ 禁用'}
                    </span>
                </td>
                <td>${this.formatDate(account.created_at)}</td>
                <td>${account.last_login_at ? this.formatDate(account.last_login_at) : '从未登录'}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-sm ${account.status === 1 ? 'btn-warning' : 'btn-success'}" 
                                onclick="accountManager.toggleAccountStatus('${account.username}', ${account.status})">
                            ${account.status === 1 ? '禁用' : '启用'}
                        </button>
                        <button class="btn btn-sm btn-danger" 
                                onclick="accountManager.deleteAccount('${account.username}')">
                            删除
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    filterAccounts(searchTerm) {
        if (!searchTerm) {
            this.filteredAccounts = [...this.accounts];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredAccounts = this.accounts.filter(account => 
                account.username.toLowerCase().includes(term) ||
                (account.display_name && account.display_name.toLowerCase().includes(term)) ||
                (account.note && account.note.toLowerCase().includes(term)) ||
                (account.email && account.email.toLowerCase().includes(term))
            );
        }
        this.renderAccountsTable();
    }

    getPermissionText(level) {
        const permissions = {
            1: 'Lv1 基础',
            2: 'Lv2 高级',
            3: 'Lv3 管理'
        };
        return permissions[level] || `Lv${level}`;
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        const table = document.getElementById('accountsTable');
        
        if (loading) {
            loading.style.display = show ? 'block' : 'none';
        }
        if (table) {
            table.style.display = show ? 'none' : 'table';
        }
    }

    showError(message) {
        // 简单的错误提示，可以后续改进为更好的UI
        alert(`❌ ${message}`);
    }

    showSuccess(message) {
        // 简单的成功提示，可以后续改进为更好的UI
        alert(`✅ ${message}`);
    }

    // ================== 模态框管理 ==================

    showAddModal() {
        const modal = document.getElementById('addModal');
        const form = document.getElementById('addForm');
        const errorDiv = document.getElementById('addError');
        
        if (modal && form) {
            // 重置表单
            form.reset();
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
            
            modal.style.display = 'block';
            
            // 聚焦到用户名输入框
            setTimeout(() => {
                const usernameInput = document.getElementById('addUsername');
                if (usernameInput) {
                    usernameInput.focus();
                }
            }, 100);
        }
    }

    closeAddModal() {
        const modal = document.getElementById('addModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // ================== 账号操作 ==================

    async addAccount() {
        const form = document.getElementById('addForm');
        const errorDiv = document.getElementById('addError');
        
        if (!form) return;

        try {
            // 获取表单数据
            const formData = new FormData(form);
            const accountData = {
                username: document.getElementById('addUsername').value.trim(),
                display_name: document.getElementById('addDisplayName').value.trim(),
                email: document.getElementById('addEmail').value.trim(),
                permission_level: parseInt(document.getElementById('addPermissionLevel').value),
                expires_at: document.getElementById('addExpiresAt').value || null,
                note: document.getElementById('addNote').value.trim()
            };

            // 基本验证
            if (!accountData.username) {
                throw new Error('用户名不能为空');
            }

            if (accountData.username.length < 2) {
                throw new Error('用户名至少需要2个字符');
            }

            // 发送请求
            const response = await fetch(`${this.baseUrl}/accounts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(accountData)
            });

            const result = await response.json();

            if (result.status === 'success') {
                this.showSuccess('账号添加成功！');
                this.closeAddModal();
                await this.loadData(); // 重新加载数据
            } else {
                throw new Error(result.message || '添加账号失败');
            }

        } catch (error) {
            console.error('添加账号失败:', error);
            if (errorDiv) {
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
            }
        }
    }

    async deleteAccount(username) {
        if (!confirm(`确定要删除账号 "${username}" 吗？此操作不可撤销！`)) {
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/accounts/${encodeURIComponent(username)}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.status === 'success') {
                this.showSuccess('账号删除成功！');
                await this.loadData(); // 重新加载数据
            } else {
                throw new Error(result.message || '删除账号失败');
            }

        } catch (error) {
            console.error('删除账号失败:', error);
            this.showError(error.message);
        }
    }

    async toggleAccountStatus(username, currentStatus) {
        const newStatus = currentStatus === 1 ? 0 : 1;
        const action = newStatus === 1 ? '启用' : '禁用';

        if (!confirm(`确定要${action}账号 "${username}" 吗？`)) {
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/accounts/${encodeURIComponent(username)}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });

            const result = await response.json();

            if (result.status === 'success') {
                this.showSuccess(`账号${action}成功！`);
                await this.loadData(); // 重新加载数据
            } else {
                throw new Error(result.message || `${action}账号失败`);
            }

        } catch (error) {
            console.error(`${action}账号失败:`, error);
            this.showError(error.message);
        }
    }

    // ================== 其他功能 ==================

    async refreshData() {
        console.log('🔄 刷新数据...');
        await this.loadData();
    }

    exportData() {
        try {
            // 使用服务器端导出
            const link = document.createElement('a');
            link.href = `${this.baseUrl}/export/accounts`;
            link.download = `账号列表_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showSuccess('账号数据导出成功！');
        } catch (error) {
            console.error('导出数据失败:', error);
            this.showError('导出数据失败');
        }
    }

    generateCSV() {
        const headers = ['用户名', '显示名', '邮箱', '权限级别', '状态', '创建时间', '最后登录', '备注'];
        const rows = this.accounts.map(account => [
            account.username,
            account.display_name || '',
            account.email || '',
            this.getPermissionText(account.permission_level),
            account.status === 1 ? '激活' : '禁用',
            this.formatDate(account.created_at),
            account.last_login_at ? this.formatDate(account.last_login_at) : '从未登录',
            account.note || ''
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return '\uFEFF' + csvContent; // 添加BOM以支持中文
    }
}

// 全局实例
let accountManager;

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    accountManager = new AccountManager();
});

// 全局函数（供HTML调用）
function showAddModal() {
    console.log('showAddModal called');
    accountManager.showAddModal();
}

function closeAddModal() {
    accountManager.closeAddModal();
}

function addAccount() {
    accountManager.addAccount();
}

function refreshData() {
    console.log('refreshData called');
    accountManager.refreshData();
}

function exportData() {
    console.log('exportData called');
    accountManager.exportData();
}