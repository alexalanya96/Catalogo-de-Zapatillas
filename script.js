const products = [
  {id:1, brand:"Puma", name:"Puma Estrellita", price:120, category:"Puma", sizes:["23","24","25"],stock:{"23":0,"24":1,"25":1}, badge:"NUEVO",image:"img/1.jpg", gallery:["img/1.jpg","img/2.jpg","img/3.jpg"]},
 ];

const state = {category:"Todos", search:"", sort:"recommended", cart:[]};
const grid = document.getElementById("productGrid");
const empty = document.getElementById("empty");

function money(v){return `S/ ${v.toFixed(2)}`}


// Inventario por talla. Si una talla no figura en stock, se considera agotada.
function stockFor(product, size){return Number(product.stock?.[size] ?? 0)}
function isSoldOut(product){return product.sizes.every(size=>stockFor(product,size)<=0)}

function renderProducts(){
  let list = products.filter(p => (state.category==="Todos" || p.category===state.category) &&
    `${p.brand} ${p.name}`.toLowerCase().includes(state.search.toLowerCase()));
  if(state.sort==="low") list.sort((a,b)=>a.price-b.price);
  if(state.sort==="high") list.sort((a,b)=>b.price-a.price);
  if(state.sort==="name") list.sort((a,b)=>a.name.localeCompare(b.name));

  grid.innerHTML = list.map(p => `
    <article class="product">
      
    <div class="product-img">
        ${isSoldOut(p) ? `<span class="badge soldout-badge">AGOTADO</span>` : (p.badge ? `<span class="badge">${p.badge}</span>` : "")}
        
        <button class="product-photo" type="button" data-view="${p.id}" aria-label="Ver fotos de ${p.brand} ${p.name}">
          <img src="${p.image || (p.gallery && p.gallery[0]) || ''}" alt="${p.brand} ${p.name}" loading="lazy">
          <span class="view-photo">VER FOTOS <b>↗</b></span>
        </button>
      </div>


      <div class="product-info">
        <div class="product-brand">${p.brand}</div>
        <h3>${p.name}</h3>
        <div class="product-price">${money(p.price)}</div>
        <div class="product-size" data-id="${p.id}">
          ${p.sizes.map(s=>{const available=stockFor(p,s)>0;return `<button class="size ${available?"":"sold-out-size"}" data-size="${s}" ${available?"":'disabled title="Talla agotada"'}>${s}${available?"": " · Agotado"}</button>`}).join("")}
        </div>
        <button class="add ${isSoldOut(p)?"add-disabled":""}" data-add="${p.id}" ${isSoldOut(p)?"disabled":""}>${isSoldOut(p)?"PRODUCTO AGOTADO":"AGREGAR AL CARRITO"}</button>
      </div>
    </article>`).join("");
  empty.hidden = list.length !== 0;
}

function renderCart(){
  const count = state.cart.reduce((a,x)=>a+x.qty,0);
  document.getElementById("cartCount").textContent = count;
  const items = document.getElementById("cartItems");
  if(!state.cart.length){
    items.innerHTML = `<p style="color:#777">Tu carrito está vacío.</p>`;
  }else{
    items.innerHTML = state.cart.map((x,i)=>`
      <div class="cart-row">
        <div><h4>${x.name}</h4><p>${x.brand} · Talla ${x.size} · ${x.qty} × ${money(x.price)}</p></div>
        <button data-remove="${i}">Quitar</button>
      </div>`).join("");
  }
  const total = state.cart.reduce((a,x)=>a+x.price*x.qty,0);
  document.getElementById("cartTotal").textContent = money(total);
}

function openCart(){
  document.getElementById("drawer").classList.add("open");
  document.getElementById("overlay").classList.add("show");
}
function closeCart(){
  document.getElementById("drawer").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}


// ================= MODAL / GALERÍA DE PRODUCTOS =================
const productModal = document.getElementById("productModal");
const modalMainImage = document.getElementById("modalMainImage");
let modalProduct = null;
let modalImages = [];
let modalImageIndex = 0;
let modalSize = "";
function showModalImage(index){
  if(!modalImages.length) return;
  modalImageIndex = (index + modalImages.length) % modalImages.length;
  modalMainImage.src = modalImages[modalImageIndex];
  modalMainImage.alt = `${modalProduct.brand} ${modalProduct.name} - foto ${modalImageIndex+1}`;
  document.getElementById("galleryCounter").textContent = `${modalImageIndex+1} / ${modalImages.length}`;
  document.querySelectorAll(".modal-thumb").forEach((b,i)=>b.classList.toggle("active",i===modalImageIndex));
  document.getElementById("galleryPrev").disabled = modalImages.length < 2;
  document.getElementById("galleryNext").disabled = modalImages.length < 2;
}
function openProductModal(id){
  modalProduct = products.find(p=>p.id===Number(id)); if(!modalProduct) return;
  modalImages = [...new Set((modalProduct.gallery && modalProduct.gallery.length ? modalProduct.gallery : [modalProduct.image]).filter(Boolean))];
  if(!modalImages.length) modalImages=[modalProduct.image || ""];
  modalImageIndex=0; modalSize="";
  document.getElementById("modalBrand").textContent=modalProduct.brand;
  document.getElementById("modalTitle").textContent=modalProduct.name;
  document.getElementById("modalPrice").textContent=money(modalProduct.price);
  document.getElementById("modalSizes").innerHTML=modalProduct.sizes.map(s=>{const available=stockFor(modalProduct,s)>0;return `<button type="button" class="size modal-size ${available?"":"sold-out-size"}" data-modal-size="${s}" ${available?"":'disabled title="Talla agotada"'}>${s}${available?"": " · Agotado"}</button>`}).join("");
  const modalAdd=document.getElementById("modalAdd");
  modalAdd.disabled=isSoldOut(modalProduct);modalAdd.textContent=isSoldOut(modalProduct)?"PRODUCTO AGOTADO":"AGREGAR AL CARRITO";
  document.getElementById("modalNote")?.replaceChildren(document.createTextNode(isSoldOut(modalProduct)?"Este modelo está agotado en todas las tallas.":"Las tallas agotadas aparecen bloqueadas. El stock se descuenta al confirmar un pedido en tu sistema de ventas."));
  document.getElementById("modalThumbnails").innerHTML=modalImages.map((src,i)=>`<button class="modal-thumb ${i===0?'active':''}" type="button" data-thumb="${i}" aria-label="Ver foto ${i+1}"><img src="${src}" alt="Vista ${i+1}"></button>`).join("");
  showModalImage(0); productModal.classList.add("open"); productModal.setAttribute("aria-hidden","false"); document.body.classList.add("modal-open");
}
function closeProductModal(){productModal.classList.remove("open");productModal.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open");}
grid.addEventListener("click",e=>{const view=e.target.closest("[data-view]");if(view) openProductModal(view.dataset.view);});
productModal.addEventListener("click",e=>{
  if(e.target.closest("[data-modal-close]")){closeProductModal();return;}
  const thumb=e.target.closest("[data-thumb]"); if(thumb){showModalImage(Number(thumb.dataset.thumb));return;}
  const size=e.target.closest("[data-modal-size]"); if(size){modalSize=size.dataset.modalSize;document.querySelectorAll(".modal-size").forEach(b=>b.classList.toggle("selected",b===size));return;}
});
document.getElementById("galleryPrev").addEventListener("click",()=>showModalImage(modalImageIndex-1));
document.getElementById("galleryNext").addEventListener("click",()=>showModalImage(modalImageIndex+1));
document.getElementById("modalAdd").addEventListener("click",()=>{
  if(!modalProduct) return; if(!modalSize){alert("Selecciona una talla disponible.");return;}
  const available=stockFor(modalProduct,modalSize);
  if(available<=0){alert("Esta talla está agotada.");return;}
  const existing=state.cart.find(x=>x.id===modalProduct.id&&x.size===modalSize);
  if(existing){if(existing.qty>=available){alert("No hay más unidades disponibles de esta talla.");return;}existing.qty++;}
  else state.cart.push({...modalProduct,size:modalSize,qty:1});
  renderCart();closeProductModal();openCart();
});
document.addEventListener("keydown",e=>{if(!productModal.classList.contains("open"))return;if(e.key==="Escape")closeProductModal();if(e.key==="ArrowLeft")showModalImage(modalImageIndex-1);if(e.key==="ArrowRight")showModalImage(modalImageIndex+1);});

grid.addEventListener("click",e=>{
  const sizeBtn=e.target.closest(".size");
  if(sizeBtn){
    sizeBtn.parentElement.querySelectorAll(".size").forEach(b=>b.classList.remove("selected"));
    sizeBtn.classList.add("selected");
    return;
  }
  const add=e.target.closest("[data-add]");
  if(add){
    const p=products.find(x=>x.id===Number(add.dataset.add));
    const box=add.previousElementSibling;
    const selected=box.querySelector(".selected");
    if(!selected){ alert("Selecciona una talla."); return; }
    const size=selected.dataset.size;
    const available=stockFor(p,size);
    if(available<=0){alert("Esta talla está agotada.");return;}
    const existing=state.cart.find(x=>x.id===p.id && x.size===size);
    if(existing){if(existing.qty>=available){alert("No hay más unidades disponibles de esta talla.");return;}existing.qty++;}
    else state.cart.push({...p,size,qty:1});
    renderCart(); openCart();
  }
});
document.getElementById("cartItems").addEventListener("click",e=>{
  const b=e.target.closest("[data-remove]");
  if(b){state.cart.splice(Number(b.dataset.remove),1);renderCart();}
});
document.getElementById("search").addEventListener("input",e=>{state.search=e.target.value;renderProducts()});
document.getElementById("sort").addEventListener("change",e=>{state.sort=e.target.value;renderProducts()});
document.getElementById("chips").addEventListener("click",e=>{
  const b=e.target.closest(".chip"); if(!b)return;
  document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));
  b.classList.add("active"); state.category=b.dataset.category; renderProducts();
});
document.getElementById("openCart").onclick=openCart;
document.getElementById("closeCart").onclick=closeCart;
document.getElementById("overlay").onclick=closeCart;
document.getElementById("clearCart").onclick=()=>{state.cart=[];renderCart()};
const checkoutModal = document.getElementById("checkoutModal");
const checkoutForm = document.getElementById("checkoutForm");
const WHATSAPP_SALES_NUMBER = "51968233506"; // Cambiar si el número de ventas es otro
const YAPE_OWNER = "Alex Alanya"; // Verificar antes de publicar
const YAPE_NUMBER = "968233506"; // Verificar antes de publicar

document.getElementById("yapeOwner").textContent = YAPE_OWNER;
document.getElementById("yapeNumber").textContent = YAPE_NUMBER;
document.getElementById("yapeQr").addEventListener("error", function(){ this.style.display="none"; });
function openCheckout(){
  if(!state.cart.length){alert("Agrega al menos un producto antes de confirmar el pedido.");return;}
  document.getElementById("checkoutTotal").textContent = money(state.cart.reduce((a,x)=>a+x.price*x.qty,0));
  checkoutModal.classList.add("open"); checkoutModal.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden";
  document.getElementById("yapeBox").hidden = document.querySelector('input[name="paymentMethod"]:checked').value !== "Yape";
}
function closeCheckout(){checkoutModal.classList.remove("open");checkoutModal.setAttribute("aria-hidden","true");document.body.style.overflow="";}
document.getElementById("checkout").onclick=()=>{closeCart();openCheckout();};
document.getElementById("closeCheckout").onclick=closeCheckout;
document.getElementById("backToCart").addEventListener("click",e=>{e.preventDefault();closeCheckout();openCart();});
document.querySelectorAll('input[name="paymentMethod"]').forEach(r=>r.addEventListener("change",()=>{document.getElementById("yapeBox").hidden=r.value!=="Yape" || !r.checked;}));
document.getElementById("copyYape").addEventListener("click",async()=>{
  try { await navigator.clipboard.writeText(YAPE_NUMBER); alert("Número de Yape copiado."); }
  catch { window.prompt("Copia el número de Yape:",YAPE_NUMBER); }
});
checkoutForm.addEventListener("submit",e=>{
  e.preventDefault();
  if(!state.cart.length){alert("Tu carrito está vacío.");closeCheckout();return;}
  const form = new FormData(checkoutForm);
  const lines = state.cart.map(x=>`• ${x.brand} ${x.name} | Talla ${x.size} | Cantidad ${x.qty} | ${money(x.price*x.qty)}`).join("\n");
  const total = state.cart.reduce((a,x)=>a+x.price*x.qty,0);
  const message = [
    "Hola A&A Urban Store 👋, quiero confirmar este pedido:", "", lines, "",
    `Total a pagar: ${money(total)}`, "", "DATOS DE ENTREGA",
    `Nombre: ${form.get("customerName")}`, `Teléfono: ${form.get("customerPhone")}`,
    `Forma de entrega: ${form.get("deliveryMethod")}`, `Distrito/ciudad: ${form.get("customerDistrict")}`,
    `Dirección/referencia: ${form.get("customerAddress") || "No indicada"}`,
    `Método de pago: ${form.get("paymentMethod")}`,
    form.get("paymentMethod") === "Yape" ? `Yape a nombre de ${YAPE_OWNER}, número ${YAPE_NUMBER}. Enviaré el comprobante por este chat.` : "Pago en efectivo, por coordinar.",
    `Indicaciones: ${form.get("orderNotes") || "Ninguna"}`,
    "", "Por favor, confirmar disponibilidad, costo de envío y pedido."
  ].join("\n");
  window.open(`https://wa.me/${WHATSAPP_SALES_NUMBER}?text=${encodeURIComponent(message)}`,"_blank","noopener");
});
document.getElementById("contactWhatsApp").href="https://wa.me/51968233506?text=Hola%20A%26A%20Urban%20Store%2C%20quiero%20consultar%20por%20zapatillas.";
document.getElementById("modalWhatsApp").addEventListener("click",()=>{});
function updateModalWhatsApp(){if(!modalProduct)return;document.getElementById("modalWhatsApp").href=`https://wa.me/51968233506?text=${encodeURIComponent(`Hola A&A Urban Store, consulto por ${modalProduct.name}${modalSize?` talla ${modalSize}`:""}. ¿Hay disponibilidad?`)}`;}
document.getElementById("modalSizes").addEventListener("click",updateModalWhatsApp);
document.getElementById("year").textContent=new Date().getFullYear();

renderProducts();renderCart();

// Supabase es opcional para previsualizar localmente. Con la configuración lista,
// el catálogo usa los productos gestionados desde admin.html.
(async function loadManagedProducts(){
  const configured = window.SUPABASE_URL && window.SUPABASE_ANON_KEY &&
    !window.SUPABASE_URL.includes("TU-PROYECTO") &&
    !window.SUPABASE_ANON_KEY.includes("TU_CLAVE");
  if (!configured || !window.supabase) return; // conserva los productos locales si aún no se configura
  try {
    const sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    const {data, error} = await sb.from("products").select("*").eq("active", true).order("created_at", {ascending:false});
    if (error) throw error;
    if (!Array.isArray(data)) return;
    const mapped = data.map((p, i) => {
      const sizes = Array.isArray(p.sizes) ? p.sizes.map(String) : [];
      const category = p.category || (["Puma","Nike","Adidas","Reebok","Asics","Urban"].includes(p.brand) ? p.brand : "Urban");
      return {
        id: p.id, brand: p.brand || "Urban", name: p.name || "Zapatilla",
        price: Number(p.price || 0), category, sizes,
        stock: p.stock && typeof p.stock === "object" ? p.stock : {},
        badge: p.badge || "", image: p.image_url || "",
        gallery: Array.isArray(p.gallery) && p.gallery.length ? p.gallery : [p.image_url || ""],
        description: p.description || ""
      };
    });
    products.splice(0, products.length, ...mapped);
    renderProducts(); renderCart();
  } catch (err) {
    console.error("No se pudo sincronizar el catálogo con Supabase:", err);
  }
})();



    /* ================================
   NUEVA COLECCION A&A URBAN STORE
================================ */
const heroImages = [
  "img/coleccion/jordan 1.jpeg",
  "img/coleccion/jordan 2.jpg",
  "img/coleccion/jordan 3.jpg",  
  "img/coleccion/jordan 4.jpg", 
];

let heroIndex = 0;
const heroShoe = document.getElementById("heroShoe");

setInterval(() => {
  heroIndex = (heroIndex + 1) % heroImages.length;

  heroShoe.style.opacity = "0";

  setTimeout(() => {
    heroShoe.src = heroImages[heroIndex];
    heroShoe.style.opacity = "1";
  }, 300);

}, 3000);
