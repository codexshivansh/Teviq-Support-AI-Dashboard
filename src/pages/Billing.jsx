import { useEffect, useState } from 'react';
import { rememberPurchase } from '../services/billingJourney';
import { api } from '../services/api';

let checkoutLoader;

function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (!checkoutLoader) {
    checkoutLoader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      const fail = () => {
        checkoutLoader = null;
        script.remove();
        reject(new Error('Razorpay Checkout could not load. Please check your connection and retry.'));
      };
      script.onload = () => window.Razorpay ? resolve() : fail();
      script.onerror = fail;
      document.head.appendChild(script);
    });
  }
  return checkoutLoader;
}

export function Billing({ brandId }) {
  return <WorkspaceBilling key={brandId} brandId={brandId} />;
}

function WorkspaceBilling({ brandId }) {
  const [plans, setPlans] = useState([]);
  const [message, setMessage] = useState('Loading plans…');
  const [busyPlan, setBusyPlan] = useState('');
  const selected = rememberPurchase(window.location.search, sessionStorage);

  useEffect(() => {
    let active = true;
    api.checkoutPlans()
      .then((data) => {
        if (!active) return;
        setPlans(data.plans || []);
        setMessage(brandId === 'teviq'
          ? 'Your internal Teviq workspace does not require a paid plan.'
          : 'Choose a plan to open Razorpay secure checkout.');
      })
      .catch((error) => active && setMessage(error.message));
    return () => { active = false; };
  }, [brandId]);

  async function startCheckout(plan) {
    setBusyPlan(plan.id);
    setMessage('Creating your secure payment order…');
    try {
      await loadCheckout();
      const order = await api.createCheckoutOrder({
        brandId,
        planId: plan.id,
        amount: plan.amount_paise,
        currency: plan.currency
      });

      const checkout = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'Teviq',
        description: `${plan.name} plan · 30 days`,
        order_id: order.order_id,
        handler: async (response) => {
          setMessage('Payment received. Verifying it securely…');
          try {
            await api.verifyCheckoutPayment({ brandId, ...response });
            setMessage('Payment verified. Your workspace plan is active.');
          } catch (error) {
            setMessage(error.message);
          } finally {
            setBusyPlan('');
          }
        },
        modal: {
          ondismiss: () => {
            setMessage('Checkout was closed. No plan was activated.');
            setBusyPlan('');
          }
        },
        retry: { enabled: true },
        theme: { color: '#4f46e5' }
      });

      checkout.on('payment.failed', (response) => {
        setMessage(response?.error?.description || 'Payment failed. You can retry when ready.');
        setBusyPlan('');
      });
      checkout.open();
    } catch (error) {
      setMessage(error.message);
      setBusyPlan('');
    }
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Plans & payment</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Choose your Teviq plan</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Payments open in Razorpay Standard Checkout. A plan is activated only after the backend verifies the payment signature and captured amount.
        </p>
      </div>

      <div role="status" aria-live="polite" className="rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm dark:bg-white/5 dark:text-slate-200">
        {message}
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.id} className={`rounded-3xl border bg-white/85 p-6 shadow-card dark:bg-white/5 ${selected === plan.name.toLowerCase() ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-line'}`}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{plan.name}</p>
            <p className="mt-4 text-3xl font-semibold text-ink">₹{(plan.amount_paise / 100).toLocaleString('en-IN')}</p>
            <p className="mt-1 text-sm text-muted">30 days</p>
            <ul className="mt-5 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              {plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
            </ul>
            <button
              type="button"
              disabled={Boolean(busyPlan) || brandId === 'teviq'}
              onClick={() => startCheckout(plan)}
              className="mt-6 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
            >
              {busyPlan === plan.id ? 'Opening checkout…' : `Pay ₹${(plan.amount_paise / 100).toLocaleString('en-IN')}`}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
