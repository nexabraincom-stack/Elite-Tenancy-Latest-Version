import { useState } from "react";
import { MapPin, Phone, Mail, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import PublicLayout from "@/components/PublicLayout";
import { useSubmitContact } from "@workspace/api-client-react";

export default function Contact() {
  const submitContact = useSubmitContact();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitContact.mutate(
      { data: form },
      {
        onSuccess: () => {
          setSubmitted(true);
          toast({ title: "Message sent!", description: "We'll be in touch within 2 hours." });
        },
      }
    );
  }

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-card to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-3">Get in touch</p>
          <h1 className="font-serif text-5xl font-bold text-foreground mb-3">Contact Us</h1>
          <p className="text-muted-foreground">We typically respond within 2 hours during business hours.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="bg-card border border-border/50 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={32} className="text-primary" />
                </div>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-3">Message Received</h2>
                <p className="text-muted-foreground">Thank you for getting in touch. A member of our team will respond within 2 hours.</p>
              </div>
            ) : (
              <div className="bg-card border border-border/50 rounded-xl p-8">
                <h2 className="font-semibold text-foreground mb-6">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs mb-1.5 block">Full Name</Label>
                      <Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your name" className="bg-background" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Email</Label>
                      <Input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="your@email.com" className="bg-background" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs mb-1.5 block">Phone (optional)</Label>
                      <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+44 7700..." className="bg-background" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Subject</Label>
                      <Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="How can we help?" className="bg-background" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Message</Label>
                    <Textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Tell us how we can help..." rows={5} className="bg-background resize-none" />
                  </div>
                  <Button type="submit" disabled={submitContact.isPending} size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    {submitContact.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>
            )}
          </div>

          <div className="space-y-5">
            {[
              { icon: MapPin, title: "Office", lines: ["Office 18077, 182-184 High Street North", "East Ham, London, E6 2JA"] },
              { icon: Phone, title: "Phone", lines: ["+44 7446 192577"] },
              { icon: Mail, title: "Email", lines: ["info@elitetenancy.co.uk"] },
              { icon: Clock, title: "Hours", lines: ["Mon–Fri: 9am–6pm", "Sat: 10am–4pm"] },
            ].map(({ icon: Icon, title, lines }) => (
              <div key={title} className="bg-card border border-border/50 rounded-xl p-5 flex gap-4">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">{title}</p>
                  {lines.map(l => <p key={l} className="text-sm text-muted-foreground">{l}</p>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
