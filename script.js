// lavou. — protótipo funcional
const defaultDB={
 users:[
  {id:1,name:"Cliente Demo",email:"cliente@lavou.com",password:"123456",role:"cliente"},
  {id:2,name:"Lavação Prime",email:"empresa@lavou.com",password:"123456",role:"empresa"},
  {id:3,name:"Administrador",email:"admin@lavou.com",password:"admin123",role:"admin"}
 ],
 washes:[
  {id:1,owner:2,name:"Lavação Prime",neighborhood:"Centro",city:"Palhoça",address:"Av. Central, 500",phone:"(48) 99999-1111",hours:"08:00 às 18:00",description:"Lavagem completa, rápida e cuidadosa para seu carro.",payments:["Pix","Cartão","Dinheiro"],amenities:["Sala de espera","Wi-Fi","Café"],rating:4.8,status:"aprovado",services:[{id:11,name:"Lavagem simples",price:35,duration:40},{id:12,name:"Lavagem completa",price:65,duration:70},{id:13,name:"Completa + cera",price:95,duration:100}]},
  {id:2,owner:2,name:"Brilho Car",neighborhood:"Pagani",city:"Palhoça",address:"Rua dos Ipês, 90",phone:"(48) 98888-2222",hours:"08:30 às 19:00",description:"Seu carro brilhando de verdade.",payments:["Pix","Cartão"],amenities:["Sala de espera"],rating:4.6,status:"aprovado",services:[{id:21,name:"Lavagem express",price:30,duration:30},{id:22,name:"Lavagem premium",price:80,duration:80}]},
  {id:3,owner:2,name:"AutoClean",neighborhood:"Pedra Branca",city:"Palhoça",address:"Rua das Flores, 120",phone:"(48) 97777-3333",hours:"09:00 às 18:00",description:"Serviço automotivo com atendimento agendado.",payments:["Pix","Cartão"],amenities:["Agendamento"],rating:null,status:"pendente",services:[{id:31,name:"Lavagem básica",price:40,duration:45}]}
 ],
 appointments:[],vehicles:[]
};

let db=load("lavouDB",defaultDB);
if(!Array.isArray(db.vehicles))db.vehicles=[];
let current=load("lavouCurrent",null);

function load(key,fallback){
 try{
  const value=localStorage.getItem(key);
  return value?JSON.parse(value):JSON.parse(JSON.stringify(fallback));
 }catch(e){return JSON.parse(JSON.stringify(fallback));}
}
function save(){
 localStorage.setItem("lavouDB",JSON.stringify(db));
 localStorage.setItem("lavouCurrent",JSON.stringify(current));
 updateHeader();
}
function money(value){
 return Number(value).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
}
function toast(message){
 const el=document.getElementById("toast");
 el.textContent=message;
 el.classList.add("show");
 setTimeout(()=>el.classList.remove("show"),2600);
}
function openModal(id){document.getElementById(id).classList.remove("hidden");if(id==="bookingModal")populateBookingVehicles()}
function closeModal(id){document.getElementById(id).classList.add("hidden")}

function updateHeader(){
 const area=document.getElementById("accountArea");
 document.getElementById("clientNav").classList.add("hidden");
 document.getElementById("vehiclesNav").classList.add("hidden");
 document.getElementById("companyNav").classList.add("hidden");
 document.getElementById("adminNav").classList.add("hidden");

 if(!current){
  area.innerHTML='<button class="btn outline" onclick="openModal(\'loginModal\')">Entrar</button><button class="btn primary" onclick="openModal(\'registerModal\')">Criar conta</button>';
  return;
 }

 if(current.role==="cliente"){document.getElementById("clientNav").classList.remove("hidden");document.getElementById("vehiclesNav").classList.remove("hidden");}
 if(current.role==="empresa")document.getElementById("companyNav").classList.remove("hidden");
 if(current.role==="admin")document.getElementById("adminNav").classList.remove("hidden");

 area.innerHTML='<span style="font-size:13px;font-weight:700">'+escapeHtml(current.name)+' · '+current.role+'</span><button class="btn outline" onclick="logout()">Sair</button>';
}

function escapeHtml(value){
 return String(value).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

function showPage(page,id=null){
 if(page==="home")renderHome();
 else if(page==="details")renderDetails(id);
 else if(page==="appointments")renderAppointments();
  else if(page==="vehicles")renderVehicles();
 else if(page==="company")renderCompany();
 else if(page==="admin")renderAdmin();
 window.scrollTo({top:0,behavior:"smooth"});
}

function renderHome(){
 const approved=db.washes.filter(w=>w.status==="aprovado");
 document.getElementById("app").innerHTML=
 '<section class="hero"><div class="hero-inner">'+
 '<div class="eyebrow">Seu carro limpo sem complicação</div>'+
 '<h1>Encontre o melhor lugar para lavar seu carro!</h1>'+
 '<p>Compare lavações próximas, veja serviços, preços e horários e marque o melhor momento para cuidar do seu carro.</p>'+
 '<div class="search"><input id="searchInput" placeholder="Busque por lavação, bairro ou cidade"><button class="btn primary" id="searchBtn">Buscar lavações</button></div>'+
 '<div class="chips"><button class="chip" data-search="Centro">Centro</button><button class="chip" data-search="Pagani">Pagani</button><button class="chip" data-search="Pedra Branca">Pedra Branca</button></div>'+
 '</div></section>'+
 '<section class="section" id="lavacoes"><div class="section-head"><div><h2>Lavações disponíveis</h2><p class="muted">Estabelecimentos aprovados pela plataforma.</p></div></div><div id="washGrid" class="grid">'+washCards(approved)+'</div></section>'+
 '<section class="section"><div class="company-banner"><div class="row"><div><div class="eyebrow" style="color:var(--green)">Para empresas</div><h2>Tenha sua lavação no lavou.</h2><p class="muted">Cadastre serviços, horários e preços e receba agendamentos.</p></div><button class="btn primary" id="companySignup">Cadastrar lavação</button></div></div></section>';

 document.getElementById("searchBtn").addEventListener("click",searchWashes);
 document.getElementById("searchInput").addEventListener("keydown",e=>{if(e.key==="Enter")searchWashes()});
 document.querySelectorAll(".chip").forEach(c=>c.addEventListener("click",()=>quickSearch(c.dataset.search)));
 document.getElementById("companySignup").addEventListener("click",()=>{
  if(current&&current.role==="empresa")showPage("company");
  else openModal("registerModal");
 });
}

function washCards(list){
 if(!list.length)return '<div class="empty" style="grid-column:1/-1"><h3>Nenhuma lavação encontrada</h3><p class="muted">Tente outro nome, bairro ou cidade.</p></div>';
 return list.map(w=>{
  const min=Math.min(...w.services.map(s=>s.price));
  return '<article class="card"><div class="car-art">🚗</div><div class="card-body"><div class="row"><h3>'+escapeHtml(w.name)+'</h3><span class="tag">Aprovada</span></div><p class="muted">📍 '+escapeHtml(w.neighborhood)+' · '+escapeHtml(w.city)+'</p><div class="row"><span class="rating">'+(w.rating?'★ '+w.rating:'Sem avaliações')+'</span><span class="price">A partir de '+money(min)+'</span></div><button class="btn primary full" onclick="showPage(\'details\','+w.id+')">Ver lavação</button></div></article>';
 }).join("");
}

function searchWashes(){
 const input=document.getElementById("searchInput");
 const q=(input.value||"").trim().toLowerCase();
 const list=db.washes.filter(w=>w.status==="aprovado"&&(!q||[w.name,w.neighborhood,w.city].some(v=>v.toLowerCase().includes(q))));
 document.getElementById("washGrid").innerHTML=washCards(list);
 document.getElementById("lavacoes").scrollIntoView({behavior:"smooth"});
}
function quickSearch(q){
 document.getElementById("searchInput").value=q;
 searchWashes();
}

function renderDetails(id){
 const w=db.washes.find(x=>x.id===Number(id));
 if(!w||w.status!=="aprovado"){toast("Lavação indisponível.");return showPage("home");}
 document.getElementById("app").innerHTML=
 '<section class="details"><button class="btn outline" onclick="showPage(\'home\')">← Voltar</button>'+
 '<div class="detail-head"><span class="tag">✓ Estabelecimento aprovado</span><h1>'+escapeHtml(w.name)+'</h1><p>📍 '+escapeHtml(w.address)+' · '+escapeHtml(w.neighborhood)+', '+escapeHtml(w.city)+'</p><p>'+escapeHtml(w.description)+'</p></div>'+
 '<div class="two"><div class="panel"><h2>Serviços</h2>'+w.services.map(s=>'<div class="service"><div><h4>'+escapeHtml(s.name)+'</h4><span class="muted">'+s.duration+' min · '+money(s.price)+'</span></div><button class="btn primary small" onclick="startBooking('+w.id+','+s.id+')">Agendar</button></div>').join("")+'</div>'+
 '<div><div class="panel"><h3>Informações</h3><p>🕒 '+escapeHtml(w.hours)+'</p><p>📞 '+escapeHtml(w.phone)+'</p><p>💳 '+escapeHtml(w.payments.join(", "))+'</p><p>✨ '+escapeHtml(w.amenities.join(", "))+'</p><p>⭐ '+(w.rating||"Ainda sem avaliações")+'</p></div></div></div></section>';
}

function startBooking(wid,sid){
 if(!current){toast("Entre como Cliente para realizar um agendamento.");openModal("loginModal");return}
 if(current.role!=="cliente"){toast("Somente clientes podem realizar agendamentos.");return}
 const w=db.washes.find(x=>x.id===wid);
 const s=w.services.find(x=>x.id===sid);
 document.getElementById("bookingWashId").value=wid;
 document.getElementById("bookingServiceId").value=sid;
 document.getElementById("bookingSummary").innerHTML='<div class="notice"><b>'+escapeHtml(w.name)+'</b><br>'+escapeHtml(s.name)+' · '+money(s.price)+' · '+s.duration+' min</div>';
 const now=new Date();
 const local=new Date(now.getTime()-now.getTimezoneOffset()*60000);
 const date=local.toISOString().slice(0,10);
 document.getElementById("bookingDate").min=date;
 document.getElementById("bookingDate").value=date;
 document.getElementById("bookingTime").innerHTML=generateTimes(w.hours);
 openModal("bookingModal");
}

function generateTimes(hours){
 let start=8,end=18;
 const nums=(hours||"").match(/\\d{1,2}/g);
 if(nums&&nums.length>=2){start=Number(nums[0]);end=Number(nums[2]||nums[1]);}
 const options=[];
 for(let h=start;h<end;h++){
  for(const m of [0,30]){
   if(h===end-1&&m>0)continue;
   options.push('<option value="'+String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+'">'+String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+'</option>');
  }
 }
 return options.join("");
}

function vehicleTypeLabel(type){return ({carro:"Carro",moto:"Moto",suv:"SUV",pickup:"Picape",van:"Van",outro:"Outro"})[type]||"Veículo";}
function vehicleCard(v){return '<div class="card"><div class="car-art">'+(v.type==="moto"?"🏍️":"🚗")+'</div><div class="card-body"><div class="row"><h3>'+escapeHtml(v.brand+" "+v.model)+'</h3><span class="tag">'+vehicleTypeLabel(v.type)+'</span></div><p class="muted">Placa: '+escapeHtml(v.plate)+' · Cor: '+escapeHtml(v.color)+'</p><p class="muted">'+(v.year?escapeHtml(String(v.year))+" · ":"")+(v.notes?escapeHtml(v.notes):"")+'</p><div class="row"><button class="btn outline small" onclick="showVehicleForm('+v.id+')">Editar</button><button class="btn danger small" onclick="removeVehicle('+v.id+')">Excluir</button></div></div></div>';}
function renderVehicles(){if(!current||current.role!=="cliente"){toast("Área exclusiva para Cliente.");return showPage("home")}const mine=db.vehicles.filter(v=>v.owner===current.id);const content=mine.length?'<div class="grid">'+mine.map(vehicleCard).join("")+'</div>':'<div class="empty"><h3>Nenhum veículo cadastrado</h3><p class="muted">Cadastre seus veículos para agilizar seus agendamentos.</p></div>';document.getElementById("app").innerHTML='<section class="section"><div class="section-head"><div><h2>Meus veículos</h2><p class="muted">Cadastre vários veículos e escolha qual será usado em cada agendamento.</p></div><button class="btn primary" onclick="showVehicleForm()">+ Novo veículo</button></div>'+content+'</section>';}
function showVehicleForm(id=null){if(!current||current.role!=="cliente"){toast("Área exclusiva para Cliente.");return showPage("home")}const v=id?db.vehicles.find(x=>x.id===Number(id)&&x.owner===current.id):null;if(id&&!v){toast("Veículo não encontrado.");return}document.getElementById("app").innerHTML='<section class="section"><button class="btn outline" onclick="showPage(\'vehicles\')">← Voltar</button><div class="panel" style="margin-top:18px"><h2>'+(v?"Editar veículo":"Cadastrar veículo")+'</h2><p class="muted">Esses dados ficarão vinculados aos seus agendamentos.</p><form id="vehicleForm"><div class="form-grid"><div><label>Marca*<input id="vehicleBrand" value="'+escapeAttr(v?.brand||"")+'" placeholder="Ex.: Honda" required></label></div><div><label>Modelo*<input id="vehicleModel" value="'+escapeAttr(v?.model||"")+'" placeholder="Ex.: Civic" required></label></div><div><label>Ano<input id="vehicleYear" type="number" min="1900" max="2100" value="'+escapeAttr(v?.year||"")+'" placeholder="Ex.: 2022"></label></div><div><label>Placa*<input id="vehiclePlate" maxlength="8" value="'+escapeAttr(v?.plate||"")+'" placeholder="ABC-1D23" required></label></div><div><label>Cor*<input id="vehicleColor" value="'+escapeAttr(v?.color||"")+'" placeholder="Ex.: Preto" required></label></div><div><label>Tipo<select id="vehicleType"><option value="carro">Carro</option><option value="moto">Moto</option><option value="suv">SUV</option><option value="pickup">Picape</option><option value="van">Van</option><option value="outro">Outro</option></select></label></div></div><label>Observações<textarea id="vehicleNotes" placeholder="Película, rodas, acessórios etc.">'+escapeHtml(v?.notes||"")+'</textarea></label><button class="btn primary" type="submit">'+(v?"Salvar alterações":"Cadastrar veículo")+'</button></form></div></section>';if(v)document.getElementById("vehicleType").value=v.type||"carro";document.getElementById("vehicleForm").addEventListener("submit",e=>saveVehicle(e,v?.id));}
function saveVehicle(e,id){e.preventDefault();if(!current||current.role!=="cliente"){toast("Área exclusiva para Cliente.");return}const data={owner:current.id,brand:document.getElementById("vehicleBrand").value.trim(),model:document.getElementById("vehicleModel").value.trim(),year:document.getElementById("vehicleYear").value.trim(),plate:document.getElementById("vehiclePlate").value.trim().toUpperCase(),color:document.getElementById("vehicleColor").value.trim(),type:document.getElementById("vehicleType").value,notes:document.getElementById("vehicleNotes").value.trim()};if(!data.brand||!data.model||!data.plate||!data.color){toast("Preencha os campos obrigatórios.");return}if(db.vehicles.some(v=>v.owner===current.id&&v.plate.toUpperCase()===data.plate&&v.id!==Number(id))){toast("Você já possui um veículo com essa placa.");return}if(id){const v=db.vehicles.find(x=>x.id===Number(id)&&x.owner===current.id);if(!v){toast("Veículo não encontrado.");return}Object.assign(v,data)}else db.vehicles.push({id:Date.now(),...data});save();toast(id?"Veículo atualizado com sucesso.":"Veículo cadastrado com sucesso.");showPage("vehicles");}
function removeVehicle(id){if(!current||current.role!=="cliente"){toast("Área exclusiva para Cliente.");return}const v=db.vehicles.find(x=>x.id===Number(id)&&x.owner===current.id);if(!v)return;if(!confirm("Excluir este veículo?"))return;db.vehicles=db.vehicles.filter(x=>x.id!==Number(id));save();toast("Veículo removido.");renderVehicles();}
function populateBookingVehicles(){const select=document.getElementById("bookingVehicleId");if(!select||!current||current.role!=="cliente")return;const mine=db.vehicles.filter(v=>v.owner===current.id);select.innerHTML='<option value="">Selecione um veículo</option>'+mine.map(v=>'<option value="'+v.id+'">'+escapeHtml(v.brand+" "+v.model+" — "+v.plate)+'</option>').join("")+'<option value="__new__">+ Cadastrar novo veículo</option>';}
function renderAppointments(){
 if(!current||current.role!=="cliente"){toast("Área exclusiva para Cliente.");return showPage("home")}
 const list=db.appointments.filter(a=>a.client===current.id).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 let content;
 if(!list.length)content='<div class="empty"><h3>Você ainda não possui agendamentos</h3><p class="muted">Encontre uma lavação e escolha um serviço.</p><button class="btn primary" onclick="showPage(\'home\')">Encontrar lavações</button></div>';
 else content='<div class="grid">'+list.map(a=>{
  const w=db.washes.find(x=>x.id===a.wash),s=w.services.find(x=>x.id===a.service);
  return '<div class="card"><div class="card-body"><span class="tag">'+escapeHtml(a.status)+'</span><h3>'+escapeHtml(w.name)+'</h3><p>'+escapeHtml(s.name)+'</p><p>🚗 '+(db.vehicles.find(x=>x.id===a.vehicle&&x.owner===current.id)?escapeHtml((db.vehicles.find(x=>x.id===a.vehicle&&x.owner===current.id)).brand+" "+(db.vehicles.find(x=>x.id===a.vehicle&&x.owner===current.id)).model+" — "+(db.vehicles.find(x=>x.id===a.vehicle&&x.owner===current.id)).plate):"Veículo não informado")+'</p><p>📅 '+formatDate(a.date)+' às '+a.time+'</p><p class="muted">📞 '+escapeHtml(a.phone)+'</p><strong>'+money(s.price)+'</strong></div></div>';
 }).join("")+'</div>';
 document.getElementById("app").innerHTML='<section class="section"><h2>Meus agendamentos</h2><p class="muted">Todos os agendamentos da sua conta.</p>'+content+'</section>';
}

function formatDate(date){return new Date(date+"T12:00:00").toLocaleDateString("pt-BR")}

function renderCompany(){
 if(!current||current.role!=="empresa"){toast("Área exclusiva para Empresa.");return showPage("home")}
 const own=db.washes.filter(w=>w.owner===current.id);
 const ap=db.appointments.filter(a=>own.some(w=>w.id===a.wash));
 document.getElementById("app").innerHTML=
 '<section class="section"><div class="section-head"><div><h2>Painel da empresa</h2><p class="muted">Gerencie suas lavações e acompanhe os agendamentos.</p></div><button class="btn primary" onclick="showCompanyForm()">+ Nova lavação</button></div>'+
 '<div class="stats"><div class="stat"><span class="muted">Lavações</span><strong>'+own.length+'</strong></div><div class="stat"><span class="muted">Publicadas</span><strong>'+own.filter(w=>w.status==="aprovado").length+'</strong></div><div class="stat"><span class="muted">Pendentes</span><strong>'+own.filter(w=>w.status==="pendente").length+'</strong></div><div class="stat"><span class="muted">Agendamentos</span><strong>'+ap.length+'</strong></div></div>'+
 '<div class="panel"><h3>Minhas lavações</h3>'+companyWashTable(own,true)+'</div>'+
 '<div class="panel" style="margin-top:18px"><h3>Agendamentos recebidos</h3>'+companyAppointments(ap)+'</div></section>';
}

function companyWashTable(list,editable=false){
 if(!list.length)return '<p class="muted">Nenhuma lavação cadastrada.</p>';
 return '<div class="table-wrap"><table><tr><th>Nome</th><th>Local</th><th>Serviços</th><th>Status</th><th>Ações</th></tr>'+list.map(w=>'<tr><td><b>'+escapeHtml(w.name)+'</b></td><td>'+escapeHtml(w.neighborhood)+', '+escapeHtml(w.city)+'</td><td>'+w.services.length+'</td><td><span class="tag '+(w.status==="pendente"?"pending":w.status==="suspenso"?"suspended":"")+'">'+w.status+'</span></td><td>'+(editable?'<button class="btn outline small" onclick="showEditWashForm('+w.id+','+editable+')">Editar</button>':'')+'</td></tr>').join("")+'</table></div>';
}
function companyAppointments(list){
 if(!list.length)return '<p class="muted">Nenhum agendamento recebido.</p>';
 return '<div class="table-wrap"><table><tr><th>Cliente</th><th>Telefone</th><th>Veículo</th><th>Serviço</th><th>Data/hora</th></tr>'+list.map(a=>{
  const u=db.users.find(x=>x.id===a.client),w=db.washes.find(x=>x.id===a.wash),s=w.services.find(x=>x.id===a.service);
  const v=db.vehicles.find(x=>x.id===a.vehicle&&x.owner===a.client); return '<tr><td>'+escapeHtml(u?u.name:"Cliente")+'</td><td>'+escapeHtml(a.phone)+'</td><td>'+escapeHtml(v?(v.brand+" "+v.model+" — "+v.plate):"Não informado")+'</td><td>'+escapeHtml(s.name)+'</td><td>'+formatDate(a.date)+' '+a.time+'</td></tr>';
 }).join("")+'</table></div>';
}

function showCompanyForm(){
 document.getElementById("app").innerHTML=
 '<section class="section"><button class="btn outline" onclick="showPage(\'company\')">← Voltar</button><div class="panel" style="margin-top:18px"><h2>Cadastrar lavação</h2><p class="muted">A nova lavação ficará pendente até a aprovação do administrador.</p>'+
 '<form id="washForm"><div class="form-grid"><div><label>Nome*<input id="wName" required></label></div><div><label>Bairro*<input id="wNeighborhood" required></label></div><div><label>Cidade*<input id="wCity" required></label></div><div><label>Endereço<input id="wAddress"></label></div><div><label>Telefone<input id="wPhone"></label></div><div><label>Horário<input id="wHours" value="08:00 às 18:00"></label></div></div><label>Descrição<textarea id="wDescription"></textarea></label><label>Comodidades<input id="wAmenities" placeholder="Sala de espera, Wi-Fi"></label><label>Formas de pagamento<input id="wPayments" placeholder="Pix, Cartão, Dinheiro"></label><h3>Primeiro serviço</h3><div class="form-grid"><div><label>Nome do serviço*<input id="sName" required></label></div><div><label>Preço*<input id="sPrice" type="number" min="0.01" step="0.01" required></label></div><div><label>Duração em minutos*<input id="sDuration" type="number" min="1" required></label></div></div><button class="btn primary" type="submit">Cadastrar lavação</button></form></div></section>';
 document.getElementById("washForm").addEventListener("submit",createWash);
}

function createWash(e){
 e.preventDefault();
 const wash={
  id:Date.now(),owner:current.id,name:document.getElementById("wName").value.trim(),
  neighborhood:document.getElementById("wNeighborhood").value.trim(),city:document.getElementById("wCity").value.trim(),
  address:document.getElementById("wAddress").value.trim(),phone:document.getElementById("wPhone").value.trim(),
  hours:document.getElementById("wHours").value.trim(),description:document.getElementById("wDescription").value.trim(),
  amenities:splitList(document.getElementById("wAmenities").value),payments:splitList(document.getElementById("wPayments").value),
  rating:null,status:"pendente",
  services:[{id:Date.now()+1,name:document.getElementById("sName").value.trim(),price:Number(document.getElementById("sPrice").value),duration:Number(document.getElementById("sDuration").value)}]
 };
 db.washes.push(wash);save();toast("Lavação cadastrada como pendente.");showPage("company");
}
function splitList(value){return value.split(",").map(x=>x.trim()).filter(Boolean)}

function escapeAttr(value){return String(value??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function editServiceRow(s,index){return '<div class="service-edit"><div class="form-grid"><div><label>Serviço<input class="service-name" value="'+escapeAttr(s.name)+'" required></label></div><div><label>Preço<input class="service-price" type="number" min="0.01" step="0.01" value="'+Number(s.price)+'" required></label></div><div><label>Duração (min)<input class="service-duration" type="number" min="1" value="'+Number(s.duration)+'" required></label></div></div><button type="button" class="btn danger small" onclick="this.parentElement.remove()">Remover serviço</button></div>';}
function showEditWashForm(id,fromAdmin=false){
 const w=db.washes.find(x=>x.id===Number(id)); if(!w){toast("Lavação não encontrada.");return}
 if(!fromAdmin&&(!current||current.role!=="empresa"||w.owner!==current.id)){toast("Você só pode editar suas próprias lavações.");return}
 document.getElementById("app").innerHTML='<section class="section"><button class="btn outline" onclick="showPage(\''+(fromAdmin?'admin':'company')+'\')">← Voltar</button><div class="panel" style="margin-top:18px"><h2>Editar lavação</h2><form id="editWashForm"><div class="form-grid"><div><label>Nome*<input id="eName" value="'+escapeAttr(w.name)+'" required></label></div><div><label>Bairro*<input id="eNeighborhood" value="'+escapeAttr(w.neighborhood)+'" required></label></div><div><label>Cidade*<input id="eCity" value="'+escapeAttr(w.city)+'" required></label></div><div><label>Endereço<input id="eAddress" value="'+escapeAttr(w.address||"")+'"></label></div><div><label>Telefone<input id="ePhone" value="'+escapeAttr(w.phone||"")+'"></label></div><div><label>Horário<input id="eHours" value="'+escapeAttr(w.hours||"")+'"></label></div></div><label>Descrição<textarea id="eDescription">'+escapeHtml(w.description||"")+'</textarea></label><label>Comodidades<input id="eAmenities" value="'+escapeAttr((w.amenities||[]).join(", "))+'"></label><label>Formas de pagamento<input id="ePayments" value="'+escapeAttr((w.payments||[]).join(", "))+'"></label><h3>Serviços</h3><div id="serviceEditor">'+(w.services||[]).map((s,i)=>editServiceRow(s,i)).join("")+'</div><button type="button" class="btn outline" onclick="addServiceRow()">+ Adicionar serviço</button> <button type="submit" class="btn primary">Salvar alterações</button></form></div></section>';
 document.getElementById("editWashForm").addEventListener("submit",e=>saveWashEdit(e,w.id,fromAdmin));
}
function addServiceRow(){document.getElementById("serviceEditor").insertAdjacentHTML("beforeend",editServiceRow({name:"Novo serviço",price:0,duration:30},Date.now()));}
function saveWashEdit(e,id,fromAdmin){
 e.preventDefault(); const w=db.washes.find(x=>x.id===Number(id)); if(!w)return;
 if(!fromAdmin&&(!current||current.role!=="empresa"||w.owner!==current.id)){toast("Você não tem permissão para editar esta lavação.");return}
 const rows=[...document.querySelectorAll(".service-edit")]; if(!rows.length){toast("A lavação precisa ter pelo menos um serviço.");return}
 const services=rows.map((r,i)=>({id:(w.services[i]&&w.services[i].id)||Date.now()+i,name:r.querySelector(".service-name").value.trim(),price:Number(r.querySelector(".service-price").value),duration:Number(r.querySelector(".service-duration").value)}));
 if(services.some(s=>!s.name||s.price<=0||s.duration<=0)){toast("Preencha corretamente os serviços.");return}
 w.name=document.getElementById("eName").value.trim(); w.neighborhood=document.getElementById("eNeighborhood").value.trim(); w.city=document.getElementById("eCity").value.trim(); w.address=document.getElementById("eAddress").value.trim(); w.phone=document.getElementById("ePhone").value.trim(); w.hours=document.getElementById("eHours").value.trim(); w.description=document.getElementById("eDescription").value.trim(); w.amenities=splitList(document.getElementById("eAmenities").value); w.payments=splitList(document.getElementById("ePayments").value); w.services=services;
 save(); toast("Lavação atualizada com sucesso."); showPage(fromAdmin?"admin":"company");
}
function adminAllWashesEditor(){return '<div class="panel" style="margin-top:18px"><h3>Editar todas as lavações</h3><p class="muted">O administrador pode editar qualquer lavação.</p>'+companyWashTable(db.washes,true)+'</div>';}
function renderAdmin(){
 if(!current||current.role!=="admin"){toast("Área exclusiva para Admin.");return showPage("home")}
 const clients=db.users.filter(u=>u.role==="cliente").length;
 const companies=db.users.filter(u=>u.role==="empresa").length;
 const published=db.washes.filter(w=>w.status==="aprovado");
 const pending=db.washes.filter(w=>w.status==="pendente");
 const suspended=db.washes.filter(w=>w.status==="suspenso");
 document.getElementById("app").innerHTML=
 '<section class="section"><h2>Painel administrativo</h2><p class="muted">Controle e moderação da plataforma.</p>'+
 '<div class="stats"><div class="stat"><span class="muted">Clientes</span><strong>'+clients+'</strong></div><div class="stat"><span class="muted">Empresas</span><strong>'+companies+'</strong></div><div class="stat"><span class="muted">Lavações publicadas</span><strong>'+published.length+'</strong></div><div class="stat"><span class="muted">Agendamentos</span><strong>'+db.appointments.length+'</strong></div></div>'+
 '<div class="panel"><h3>Pendentes</h3>'+pending.map(adminRow).join("")+(pending.length?"":'<p class="muted">Nenhuma lavação pendente.</p>')+'</div>'+
 '<div class="panel" style="margin-top:18px"><h3>Publicadas</h3>'+published.map(adminRow).join("")+(published.length?"":'<p class="muted">Nenhuma lavação publicada.</p>')+'</div>'+
 '<div class="panel" style="margin-top:18px"><h3>Suspensas</h3>'+suspended.map(adminRow).join("")+(suspended.length?"":'<p class="muted">Nenhuma lavação suspensa.</p>')+'</div>'+adminAllWashesEditor()+'</section>';
}
function adminRow(w){
 let actions="";
 if(w.status==="pendente")actions='<button class="btn primary small" onclick="moderate('+w.id+',\'aprovado\')">Aprovar</button><button class="btn danger small" onclick="moderate('+w.id+',\'removido\')">Recusar</button>';
 if(w.status==="aprovado")actions='<button class="btn outline small" onclick="moderate('+w.id+',\'suspenso\')">Suspender</button>';
 if(w.status==="suspenso")actions='<button class="btn primary small" onclick="moderate('+w.id+',\'aprovado\')">Reativar</button>';
 actions+='<button class="btn danger small" onclick="removeWash('+w.id+')">Excluir</button>';
 return '<div class="service"><div><b>'+escapeHtml(w.name)+'</b><div class="muted">'+escapeHtml(w.neighborhood)+', '+escapeHtml(w.city)+' · '+w.status+'</div></div><div style="display:flex;gap:6px;flex-wrap:wrap">'+actions+'</div></div>';
}
function moderate(id,status){
 if(status==="removido")db.washes=db.washes.filter(w=>w.id!==id);
 else {const w=db.washes.find(w=>w.id===id);if(w)w.status=status}
 save();toast("Ação realizada.");renderAdmin();
}
function removeWash(id){if(confirm("Excluir permanentemente esta lavação?"))moderate(id,"removido")}

function login(e){
 e.preventDefault();
 const email=document.getElementById("loginEmail").value.trim().toLowerCase();
 const password=document.getElementById("loginPassword").value;
 const user=db.users.find(u=>u.email.toLowerCase()===email&&u.password===password);
 if(!user){toast("E-mail ou senha inválidos.");return}
 current={id:user.id,name:user.name,email:user.email,role:user.role};
 save();closeModal("loginModal");toast("Login realizado com sucesso.");
 showPage(user.role==="cliente"?"home":user.role==="empresa"?"company":"admin");
}
function register(e){
 e.preventDefault();
 const name=document.getElementById("registerName").value.trim();
 const email=document.getElementById("registerEmail").value.trim().toLowerCase();
 const password=document.getElementById("registerPassword").value;
 const role=document.getElementById("registerRole").value;
 if(db.users.some(u=>u.email.toLowerCase()===email)){toast("Este e-mail já está cadastrado.");return}
 const user={id:Date.now(),name,email,password,role};
 db.users.push(user);current={id:user.id,name,email,role};save();closeModal("registerModal");toast("Conta criada.");
 showPage(role==="cliente"?"home":"company");
}
function logout(){current=null;save();toast("Sessão encerrada.");showPage("home")}

document.getElementById("loginForm").addEventListener("submit",login);
document.getElementById("registerForm").addEventListener("submit",register);
document.getElementById("bookingForm").addEventListener("submit",function(e){
 e.preventDefault();
 if(!current||current.role!=="cliente"){toast("Você precisa estar logado como Cliente.");return}
 const date=document.getElementById("bookingDate").value;
 const time=document.getElementById("bookingTime").value;
 const today=new Date();today.setHours(0,0,0,0);
 const selected=new Date(date+"T00:00:00");
 if(selected<today){toast("A data não pode ser anterior à atual.");return}
 const wid=Number(document.getElementById("bookingWashId").value);
 const sid=Number(document.getElementById("bookingServiceId").value);
 const vehicleId=document.getElementById("bookingVehicleId")?.value;
 if(!vehicleId||vehicleId==="__new__"){toast("Selecione um veículo para o agendamento.");if(vehicleId==="__new__")showPage("vehicles");return}
 const vehicle=db.vehicles.find(v=>v.id===Number(vehicleId)&&v.owner===current.id);
 if(!vehicle){toast("Veículo inválido.");return}
 db.appointments.push({id:Date.now(),client:current.id,wash:wid,service:sid,vehicle:vehicle.id,date,time,phone:document.getElementById("bookingPhone").value,status:"confirmado"});
 save();closeModal("bookingModal");toast("Agendamento realizado com sucesso.");showPage("appointments");
});

updateHeader();
showPage("home");
