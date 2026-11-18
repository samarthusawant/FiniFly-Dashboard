const API = '/api';
let revenueChart, revenuePie, customerChart;
const $ = (s) => document.querySelector(s);
const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', {maximumFractionDigits:0});
const toast = (msg) => { const el=$('#toast'); el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2600); };
async function request(path, options={}) {
  const res = await fetch(API+path, {credentials:'same-origin',headers:{'Content-Type':'application/json',...(options.headers||{})},...options});
  const data = await res.json().catch(()=>({error:'Unexpected server response'}));
  if(!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
function dateText(value){ return new Date(value+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); }
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

async function loadDashboard(){
  const data=await request('/dashboard');
  const nums=document.querySelectorAll('.counter');
  const values=[data.totalRevenue,data.netProfit,data.activeCustomers,data.aum];
  nums.forEach((el,i)=>{el.textContent=Number(values[i]||0).toLocaleString('en-IN');});
  const revenueCanvas=$('#revenueChart'), pieCanvas=$('#revenuePie'), customerCanvas=$('#customerChart');
  if(!revenueCanvas || !pieCanvas || !customerCanvas || !window.Chart) return;
  const year=$('#revenueFilter')?.value || new Date().getFullYear();
  const chartData=await request('/analytics?year='+year);
  if(revenueChart) revenueChart.destroy();
  if(revenuePie) revenuePie.destroy();
  if(customerChart) customerChart.destroy();
  revenueChart=new Chart(revenueCanvas,{type:'line',data:{labels:chartData.months,datasets:[{label:'Revenue (₹)',data:chartData.revenue,borderColor:'#6c5ce7',backgroundColor:'rgba(108,92,231,.12)',fill:true,tension:.4,borderWidth:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{callback:v=>'₹'+Number(v).toLocaleString('en-IN')}}}}});
  revenuePie=new Chart(pieCanvas,{type:'doughnut',data:{labels:chartData.segments.map(x=>x.name),datasets:[{data:chartData.segments.map(x=>x.total),backgroundColor:['#7160e8','#19b77a','#f6a623','#4e9eea'],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:'72%',plugins:{legend:{display:false}}}});
  customerChart=new Chart(customerCanvas,{type:'bar',data:{labels:chartData.months,datasets:[{label:'New customers',data:chartData.customers,backgroundColor:'#19b77a',borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}}});
}
async function loadTransactions(){
  const q=encodeURIComponent($('#searchInput')?.value || '');
  const rows=await request('/transactions?search='+q);
  const tbody=$('#transactionTable');
  tbody.innerHTML=rows.map(t=>`<tr>
    <td><div class="customer"><div class="customer-avatar">${escapeHtml(t.initials)}</div><div><strong>${escapeHtml(t.customer_name)}</strong><span>${escapeHtml(t.customer_type||'Customer')}</span></div></div></td>
    <td>#${escapeHtml(t.reference)}</td><td><span class="type ${t.type.toLowerCase()}-type">${escapeHtml(t.type)}</span></td>
    <td>${dateText(t.date)}</td><td class="amount ${t.type==='Withdrawal'?'negative':''}">${t.type==='Withdrawal'?'-':'+'}${money(t.amount)}</td>
    <td><span class="status ${t.status.toLowerCase()}">${escapeHtml(t.status)}</span></td>
    <td><div class="row-actions"><button title="Edit" data-edit="${t.id}"><i class="fa-solid fa-pen"></i></button><button class="delete-btn" title="Delete" data-delete="${t.id}"><i class="fa-solid fa-trash"></i></button></div></td>
  </tr>`).join('') || '<tr><td colspan="7">No transactions found.</td></tr>';
}
async function loadCustomers(){
  const customers=await request('/customers');
  const target=$('#customerCards');
  if(!target) return;
  target.innerHTML=customers.map(c=>`<div class="customer-segment"><i class="fa-solid fa-user"></i><strong>${escapeHtml(c.name)}</strong><span>${escapeHtml(c.email)}</span><b>${escapeHtml(c.type)}</b></div>`).join('');
}
function openModal(id){$('#'+id).classList.add('show');$('#'+id).setAttribute('aria-hidden','false');}
function closeModal(id){$('#'+id).classList.remove('show');$('#'+id).setAttribute('aria-hidden','true');}
function openTransaction(t){
  $('#transactionForm').reset(); $('#transactionId').value=t?.id||'';
  $('#transactionModalTitle').textContent=t?'Edit transaction':'Add transaction';
  $('#txCustomer').value=t?.customer_name||'';
  $('#txType').value=t?.type||'Investment'; $('#txAmount').value=t?.amount||'';
  $('#txStatus').value=t?.status||'Completed'; $('#txDate').value=t?.date||new Date().toISOString().slice(0,10);
  openModal('transactionModal');
}
document.addEventListener('click',async e=>{
  const close=e.target.closest('[data-close]'); if(close){closeModal(close.dataset.close);return;}
  if(e.target.classList.contains('modal-backdrop')){closeModal(e.target.id);return;}
  if(e.target.closest('#addTransactionBtn')) openTransaction();
  if(e.target.closest('#addCustomerBtn')){ $('#customerForm').reset(); openModal('customerModal'); }
  const edit=e.target.closest('[data-edit]'); if(edit){const list=await request('/transactions');const t=list.find(x=>x.id===Number(edit.dataset.edit));if(t)openTransaction(t);}
  const del=e.target.closest('[data-delete]'); if(del && confirm('Delete this transaction?')){try{await request('/transactions/'+del.dataset.delete,{method:'DELETE'});await refresh();toast('Transaction deleted');}catch(err){toast(err.message);}}
  if(e.target.closest('#exportBtn')) window.location.href=API+'/transactions/export.csv';
});
$('#transactionForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const id=$('#transactionId').value;
  const body={customer_name:$('#txCustomer').value.trim(),type:$('#txType').value,amount:Number($('#txAmount').value),status:$('#txStatus').value,date:$('#txDate').value};
  try{await request('/transactions'+(id?'/'+id:''),{method:id?'PUT':'POST',body:JSON.stringify(body)});closeModal('transactionModal');await refresh();toast(id?'Transaction updated':'Transaction added');}catch(err){toast(err.message);}
});
$('#customerForm')?.addEventListener('submit',async e=>{
  e.preventDefault();const body={name:$('#customerName').value.trim(),email:$('#customerEmail').value.trim(),type:$('#customerType').value};
  try{await request('/customers',{method:'POST',body:JSON.stringify(body)});closeModal('customerModal');await loadCustomers();toast('Customer added');}catch(err){toast(err.message);}
});
async function refresh(){await Promise.all([loadDashboard(),loadTransactions(),loadCustomers()]);}
$('#searchInput')?.addEventListener('input',()=>{clearTimeout(window.searchTimer);window.searchTimer=setTimeout(loadTransactions,250);});
$('#revenueFilter')?.addEventListener('change',loadDashboard);
$('#themeToggle')?.addEventListener('click',()=>{document.body.classList.toggle('dark');const icon=$('#themeToggle i');icon.classList.toggle('fa-sun');icon.classList.toggle('fa-moon');localStorage.setItem('finifly-theme',document.body.classList.contains('dark')?'dark':'light');});
if(localStorage.getItem('finifly-theme')==='dark')document.body.classList.add('dark');
$('#menuBtn')?.addEventListener('click',()=>$('#sidebar')?.classList.toggle('open'));
document.querySelectorAll('.nav-link').forEach(a=>a.addEventListener('click',()=>{document.querySelectorAll('.nav-link').forEach(x=>x.classList.remove('active'));a.classList.add('active');if(innerWidth<=900)$('#sidebar')?.classList.remove('open');}));
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#searchInput')?.focus();}if(e.key==='Escape')document.querySelectorAll('.modal-backdrop.show').forEach(m=>closeModal(m.id));});
$('#loginForm')?.addEventListener('submit',async e=>{
  e.preventDefault();$('#loginError').textContent='';
  try{await request('/login',{method:'POST',body:JSON.stringify({email:$('#loginEmail').value,password:$('#loginPassword').value})});$('#loginScreen').classList.add('hidden');await refresh();}
  catch(err){$('#loginError').textContent=err.message;}
});
(async()=>{try{const me=await request('/me');if(me.user){$('#loginScreen').classList.add('hidden');await refresh();}document.body.classList.add('loaded');}catch(e){toast('Cannot connect to server: '+e.message);console.error(e);}})();

// Admin logout shortcut: click the profile area while holding Alt.
document.querySelector('.top-profile')?.addEventListener('click',async e=>{if(e.altKey){await request('/logout',{method:'POST'});location.reload();}});
