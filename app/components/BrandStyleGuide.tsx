import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function BrandStyleGuide() {
  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8 font-sans">
      <h1 className="text-dts-darkblue font-bold text-3xl mb-4">Brand Style Guide</h1>
      <section>
        <h2 className="text-dts-darkblue font-bold text-xl mb-2">Buttons</h2>
        <div className="flex gap-4 flex-wrap">
          <Button className="bg-dts-blue hover:bg-dts-darkblue text-white font-bold rounded-md shadow-md transition">Primary</Button>
          <Button className="bg-dts-darkblue hover:bg-dts-blue text-white font-bold rounded-md shadow-md transition">Dark</Button>
          <Button className="bg-dts-neongreen text-dts-black font-bold rounded-md shadow-md transition">Accent</Button>
        </div>
      </section>
      <section>
        <h2 className="text-dts-darkblue font-bold text-xl mb-2">Cards</h2>
        <Card className="bg-white border border-dts-blue/20 rounded-lg shadow-sm max-w-md">
          <CardHeader>
            <CardTitle className="text-dts-darkblue font-bold">Card Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-dts-black">This is a card using the brand style.</p>
          </CardContent>
        </Card>
      </section>
      <section>
        <h2 className="text-dts-darkblue font-bold text-xl mb-2">Badges</h2>
        <div className="flex gap-4 flex-wrap">
          <Badge className="bg-dts-neongreen text-dts-black font-semibold rounded px-2">Neon Green</Badge>
          <Badge className="bg-dts-lightblue text-dts-darkblue font-semibold rounded px-2">Light Blue</Badge>
          <Badge className="bg-dts-darkblue text-white font-semibold rounded px-2">Dark Blue</Badge>
        </div>
      </section>
      <section>
        <h2 className="text-dts-darkblue font-bold text-xl mb-2">Inputs</h2>
        <Input className="border-dts-blue focus:ring-dts-blue rounded-md text-dts-darkblue" placeholder="Type here..." />
      </section>
      <section>
        <h2 className="text-dts-darkblue font-bold text-xl mb-2">Typography</h2>
        <div className="space-y-2">
          <h1 className="text-dts-darkblue font-bold text-3xl">Heading 1</h1>
          <h2 className="text-dts-darkblue font-bold text-2xl">Heading 2</h2>
          <h3 className="text-dts-darkblue font-bold text-xl">Heading 3</h3>
          <p className="text-dts-black">Body text using brand color and Montserrat font.</p>
          <a className="text-dts-blue hover:text-dts-darkblue underline" href="#">Brand Link Example</a>
        </div>
      </section>
      <section>
        <h2 className="text-dts-darkblue font-bold text-xl mb-2">Table Example</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-dts-blue/10 rounded-lg">
            <thead>
              <tr className="bg-dts-blue text-white font-bold">
                <th className="px-4 py-2">Header 1</th>
                <th className="px-4 py-2">Header 2</th>
              </tr>
            </thead>
            <tbody>
              <tr className="even:bg-dts-lightblue/10 hover:bg-dts-lightblue/20">
                <td className="px-4 py-2">Cell 1</td>
                <td className="px-4 py-2">Cell 2</td>
              </tr>
              <tr className="even:bg-dts-lightblue/10 hover:bg-dts-lightblue/20">
                <td className="px-4 py-2">Cell 3</td>
                <td className="px-4 py-2">Cell 4</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
} 