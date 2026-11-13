import { useEffect, useState } from 'react';
import { rememberPurchase } from '../services/billingJourney';
import { api } from '../services/api';
let checkoutLoader;
function loadCheckout() {
 if(window.Razorpay)return Promise.resolve();
 if(!checkoutLoader)checkoutLoader=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';
  const fail=()=>{checkoutLoader=null;script.remove();reject(new Error('Checkout could not load. Please retry.'));};
  script.onload=()=>window.Razorpay?resolve():fail();script.onerror=fail;document.head.appendChild(script);
 });return checkoutLoader;
}
function date(value){return value?new Date(value).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'})+' IST':'—';}
export function Billing({brandId}){return <WorkspaceBilling key={brandId} brandId={brandId}/>;}
function WorkspaceBilling({brandId}){
 const [plans,setPlans]=useState([]),[subscription,setSubscription]=useState(null),[version,setVersion]=useState('');
 const [message,setMessage]=useState('Loading subscription details…'),[busy,setBusy]=useState(false),[consent,setConsent]=useState(false),[confirmCancel,setConfirmCancel]=useState(false);
 const selected=rememberPurchase(window.location.search,sessionStorage);
 useEffect(()=>{let active=true;Promise.all([api.subscriptionPlans(),api.subscriptionStatus(brandId)]).then(([catalog,status])=>{if(active){setPlans(catalog.plans);setVersion(catalog.consentVersion);setSubscription(status.subscription);setMessage('Test mode — no real subscription charges.');}}).catch(e=>{if(active)setMessage(e.message);});return()=>{active=false;};},[brandId]);
 async function refresh(){setBusy(true);try{const data=await api.subscriptionAction(brandId,'refresh');setSubscription(data.subscription);setMessage('Subscription status updated.');}catch(e){setMessage(e.message);}finally{setBusy(false);}}
 async function cancel(){setBusy(true);try{const data=await api.subscriptionAction(brandId,'cancel');setSubscription(data.subscription);setConfirmCancel(false);setMessage(data.subscription.cancelled?'Cancellation confirmed. Access remains until the trial or paid period ends.':'Cancellation pending. Please check status before the charge deadline.');}catch(e){setMessage(e.message);const state=await api.subscriptionStatus(brandId).catch(()=>null);if(state)setSubscription(state.subscription);}finally{setBusy(false);}}
 async function start(planId){setBusy(true);try{await loadCheckout();const data=await api.startSubscription(brandId,planId,version);setSubscription(data.subscription);const s=data.subscription;if(!s.providerSubscriptionId||s.cancelRequested||s.cancelled){setMessage('Subscription setup needs review. Please check status or contact support.');return;}
 new window.Razorpay({key:data.keyId,subscription_id:s.providerSubscriptionId,name:'Teviq trial (test)',description:`First monthly charge after ${date(s.trialEndsAt)}`,handler:refresh,modal:{ondismiss:()=>setMessage('Authorization window closed. Check status; your trial deadline has not changed.')}}).open();
 }catch(e){setMessage(e.message);const state=await api.subscriptionStatus(brandId).catch(()=>null);if(state)setSubscription(state.subscription);}finally{setBusy(false);}}
 return <section className="p-6 space-y-5 max-w-5xl">
 <h1 className="text-2xl font-semibold">Trial and subscription</h1><p role="status" aria-live="polite">{message}</p>
 <p>Start a 72-hour trial and authorize monthly autopay. Cancel before the displayed first-charge deadline if you do not wish to continue. Cancellation must be confirmed; a charge already in progress may require support.</p>
 {subscription?<div className="rounded-xl border p-5 space-y-3">
 <h2 className="text-xl font-semibold">Your subscription</h2><p>Status: {subscription.status}</p>
 <p>Trial started: {date(subscription.trialStartedAt)}</p><p>{subscription.cancelled ? 'Trial ends (autopay cancelled): ' : 'Trial ends / first scheduled charge: '}<strong>{date(subscription.trialEndsAt)}</strong></p>
 <p>₹{(subscription.amount/100).toLocaleString('en-IN')} per month · up to 12 monthly charges under this test mandate.</p>
 <p>Paid access until: {date(subscription.paidUntil)}</p>{subscription.reviewRequired && <p role="alert">A payment needs support review. New channel use is paused while it is investigated.</p>}
 {subscription.cancelRequested&&!subscription.cancelled&&<p role="alert">Cancellation requested; gateway confirmation is pending. Retry or contact support before your deadline.</p>}
 {subscription.cancelled&&<p>Autopay cancellation confirmed. Your existing trial or paid access keeps its original end date.</p>}
 <div className="flex gap-3 flex-wrap"><button disabled={busy} onClick={refresh} className="rounded-lg border p-3">Refresh status</button>
 {!subscription.cancelled&&<button disabled={busy} onClick={()=>setConfirmCancel(true)} className="rounded-lg border p-3">Cancel autopay</button>}
 {subscription.status==='created'&&!subscription.cancelRequested&&<button disabled={busy} onClick={()=>start(subscription.planId)} className="rounded-lg border p-3">Complete authorization</button>}</div>
 {confirmCancel&&<div role="alert" className="border rounded-lg p-4"><p>Stop future subscription charges? Existing access will keep its expiry date. This does not reverse a payment already processed.</p><button disabled={busy} onClick={cancel} className="border rounded-lg p-3 m-2">Confirm cancellation</button><button onClick={()=>setConfirmCancel(false)} className="border rounded-lg p-3">Keep subscription</button></div>}
 </div>:<>
 <p>Trial begins when you start setup below. First charge is scheduled 72 hours later. Any payment-method authorization charge will be shown by the gateway. The test mandate covers up to 12 monthly charges and can be cancelled. Test limits: 30 calls and 30,000 tokens/day. Channels require separate connection.</p>
 <label className="flex gap-3"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>I agree to monthly autopay at the selected price after the 72-hour trial, and understand how to cancel before the first charge.</label>
 <div className="grid gap-4 md:grid-cols-3">{plans.map(plan=><article key={plan.id} className="rounded-xl border p-5 space-y-3"><h2 className="text-xl font-semibold">{plan.name}{selected===plan.name.toLowerCase()?' · Selected':''}</h2><p>₹{(plan.amount_paise/100).toLocaleString('en-IN')}/month · test price</p><p>{plan.features.join(', ')}</p><button disabled={busy||!consent||brandId==='teviq'} onClick={()=>start(plan.id)} className="rounded-lg border p-3 disabled:opacity-50">Start trial & authorize autopay</button></article>)}</div></>}
 {brandId==='teviq'&&<p>Your internal Teviq workspace does not require a subscription.</p>}
 </section>;
}
