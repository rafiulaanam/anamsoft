"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Service {
  id: string;
}
interface PortfolioItem {
  id: string;
}
interface Lead {
  id: string;
  name: string;
  salonName: string;
  createdAt: string;
  isRead: boolean;
}

export default function AdminOverviewPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sRes, pRes, lRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/portfolio"),
          fetch("/api/leads"),
        ]);
        if (!sRes.ok || !pRes.ok || !lRes.ok) throw new Error("Failed to load data");
        const [sData, pData, lData] = await Promise.all([sRes.json(), pRes.json(), lRes.json()]);
        setServices(sData.data ?? []);
        setPortfolio(pData.data ?? []);
        setLeads((lData.data ?? []).slice(0, 5));
      } catch (err: any) {
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-600">Anam Soft Admin</p>
      </div>

      {loading && <p className="text-sm text-slate-600">Loading...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{services.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Portfolio items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{portfolio.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{leads.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent leads</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <p className="text-sm text-slate-600">No leads yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Salon</TableHead>
                  <TableHead>Created at</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{lead.name}</TableCell>
                    <TableCell>{lead.salonName}</TableCell>
                    <TableCell>{new Date(lead.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={lead.isRead ? "bg-slate-200 text-slate-700" : "bg-blush-100 text-blush-700"}>
                        {lead.isRead ? "Read" : "Unread"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
