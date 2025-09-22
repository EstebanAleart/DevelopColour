import { useState, useEffect } from "react";
import SalonesList from "./SalonesList";
import VendedoresList from "./VendedoresList";

export default function InformacionTab({ API_URL, data, setData }) {
  return (
    <div className="space-y-6">
      <SalonesList API_URL={API_URL} data={data} setData={setData} />
      <VendedoresList API_URL={API_URL} data={data} setData={setData} />
    </div>
  );
}
