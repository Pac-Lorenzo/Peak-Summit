import { Card } from "../components/Card";

export function Contact() {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Get in Touch</h1>
        <p className="text-lg text-slate-600">
          Interested in learning more about our investment approach? We’d love to hear from you.
        </p>
      </header>

      <Card className="p-6">
        {/* Netlify Forms-ready markup (works once deployed on Netlify) */}
        <form
          name="contact"
          method="POST"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          className="space-y-5"
        >
          <input type="hidden" name="form-name" value="contact" />
          <p className="hidden">
            <label>
              Don’t fill this out: <input name="bot-field" />
            </label>
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500"
                placeholder="you@email.com"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700" htmlFor="subject">Subject</label>
            <input
              id="subject"
              name="subject"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500"
              placeholder="What's this regarding?"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700" htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500"
              placeholder="Tell us more about your inquiry..."
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Send Message
          </button>

          <p className="text-sm text-slate-500">We typically respond within 24–48 hours.</p>
        </form>
      </Card>
    </div>
  );
}
