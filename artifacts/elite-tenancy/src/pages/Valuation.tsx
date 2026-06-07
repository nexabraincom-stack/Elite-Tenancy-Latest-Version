import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PublicLayout from "@/components/PublicLayout";
import { useSubmitValuation } from "@workspace/api-client-react";
import { useSeo } from "@/hooks/use-seo";

export default function Valuation() {
  useSeo({
    title: "Free Rental Valuation | Elite Tenancy",
    description: "Get a free, data-driven rental valuation for your UK property. Elite Tenancy's experts advise on achievable rent and presentation.",
    canonical: "https://www.elitetenancy.co.uk/valuation",
  });
  const submitValuation = useSubmitValuation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", postcode: "",
    propertyType: "flat", bedrooms: 2, message: "",
  });

  function update(field: string, value: unknown) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitValuation.mutate(
      { data: form },
      {
        onSuccess: () => {
          setSubmitted(true);
          toast({ title: "Valuation request sent!", description: "We will contact you within 24 hours." });
        },
      }
    );
  }

  if (submitted) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-primary" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-3">Request Received</h1>
          <p className="text-muted-foreground text-lg">
            Thank you, {form.name}. A member of our valuation team will contact you within 24 hours to arrange a convenient time to visit your property.
          </p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-card to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-3">Free of charge</p>
          <h1 className="font-serif text-5xl font-bold text-foreground mb-3">Free Rental Valuation</h1>
          <p className="text-muted-foreground max-w-xl">
            Find out what your property could achieve on the rental market. Our team will visit and provide a detailed, data-backed assessment.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card border border-border/50 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs mb-1.5 block">Full Name</Label>
                <Input required value={form.name} onChange={e => update("name", e.target.value)} placeholder="Your name" className="bg-background" />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Email</Label>
                <Input type="email" required value={form.email} onChange={e => update("email", e.target.value)} placeholder="your@email.com" className="bg-background" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs mb-1.5 block">Phone</Label>
                <Input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+44 7700..." className="bg-background" />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Postcode</Label>
                <Input required value={form.postcode} onChange={e => update("postcode", e.target.value)} placeholder="M1 3BN" className="bg-background" />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Property Address</Label>
              <Input value={form.address} onChange={e => update("address", e.target.value)} placeholder="14 High Street, Manchester" className="bg-background" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs mb-1.5 block">Property Type</Label>
                <Select value={form.propertyType} onValueChange={v => update("propertyType", v)}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat / Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="penthouse">Penthouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Bedrooms</Label>
                <Select value={String(form.bedrooms)} onValueChange={v => update("bedrooms", Number(v))}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Studio</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Additional Notes (optional)</Label>
              <Textarea value={form.message} onChange={e => update("message", e.target.value)} placeholder="Any additional information about your property or requirements..." rows={3} className="bg-background resize-none" />
            </div>
            <Button type="submit" disabled={submitValuation.isPending} size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {submitValuation.isPending ? "Sending..." : "Request Free Valuation"}
            </Button>
          </form>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {["No obligation", "Within 24 hours", "Completely free"].map(s => (
            <div key={s} className="bg-card border border-border/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">{s}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
