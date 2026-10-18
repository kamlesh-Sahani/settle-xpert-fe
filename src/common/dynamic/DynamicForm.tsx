"use client";
import { FormProvider, useForm } from "react-hook-form";
import DynamicFields from "./DynamicFields";
import { useFetch } from "@/hooks/useFetch";
import api from "@/common/utils/api";
import type { VelocityConfig } from "velocity-http";
import getInitialValues from "@/common/utils/getInitialValues";
import { useMemo } from "react";
import { Skeleton } from "antd";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateZodSchema } from "@/common/utils/generateZodSchema";
import ButtonField from "../basic/ButtonField";

interface dynamicFormPropsType {
  apiUrl: string;
  method?: string;
  options?: VelocityConfig;
}

const DynamicForm = ({ apiUrl, method, options }: dynamicFormPropsType) => {
  const { data, loading, error: _error, refetch: _refetch } = useFetch({
    client: method === "POST" ? api.post : api.get,
    url: apiUrl,
    dontCall: !apiUrl,
    options,
  });

  const _fields = (data as any)?.data;

  const formSchema = {
    rows: [
      [
        {
          id: "h1",
          span: 24,
          offset: 2,
          type: "heading",
          label: "1. User Profile",
          fontSize: 12,
          color: 'red',
          fontWeight: '500'
        },
      ],

      [
        {
          id: "f1",
          span: 10,
          offset: 0,
          type: "text",
          label: "Full Name",
          tooltip: "Please enter your legal first and last name as it appears on your passport.",
          placeholder: "Enter full name",
          defaultValue: "Kamlesh Kumar",
          validation: {
            required: true,
            minLength: 3,
          },
        },

        {
          id: "f2",
          span: 10,
          offset: 0,
          type: "email",
          label: "Email Address",
          placeholder: "example@email.com",
          validation: {
            required: true,
          },
        },
      ],

      [
        {
          id: "f3",
          span: 7,
          offset: 1,
          type: "phone",
          label: "Phone Number",
          placeholder: "+91 9876543210",
        },

        {
          id: "f4",
          span: 4,
          offset: 1,
          type: "number",
          label: "Age",
          defaultValue: 25,
        },
      ],

      [
        {
          id: "f5",
          span: 10,
          offset: 1,
          type: "radio",
          label: "Gender",
          defaultValue: "male",
          options: [
            {
              label: "Male",
              value: "male",
            },
            {
              label: "Female",
              value: "female",
            },
            {
              label: "Other",
              value: "other",
            },
          ],
        },
      ],

      [
        {
          id: "div1",
          span: 24,
          offset: 0,
          type: "divider",
        },
      ],

      [
        {
          id: "h2",
          span: 24,
          offset: 0,
          type: "heading",
          label: "2. Address Information",
        },
      ],

      [
        {
          id: "f6",
          span: 6,
          offset: 1,
          type: "country",
          label: "Country",
          defaultValue: "IN",
        },

        {
          id: "f7",
          span: 6,
          offset: 1,
          type: "select",
          label: "State",
          defaultValue: "delhi",
          options: [
            {
              label: "Delhi",
              value: "delhi",
            },
            {
              label: "Maharashtra",
              value: "mh",
            },
            {
              label: "Karnataka",
              value: "ka",
            },
          ],
        },

        {
          id: "f8",
          span: 6,
          offset: 1,
          type: "text",
          label: "City",
          placeholder: "Enter city",
          defaultValue: "New Delhi",
        },
      ],

      [
        {
          id: "f9",
          span: 20,
          offset: 2,
          type: "textarea",
          label: "Full Address",
          placeholder: "Enter complete address",
        },
      ],

      [
        {
          id: "div2",
          span: 24,
          offset: 0,
          type: "divider",
        },
      ],

      [
        {
          id: "h3",
          span: 24,
          offset: 0,
          type: "heading",
          label: "3. Professional Information",
        },
      ],

      [
        {
          id: "f10",
          span: 10,
          offset: 1,
          type: "select",
          label: "Occupation",
          defaultValue: "developer",
          options: [
            {
              label: "Developer",
              value: "developer",
            },
            {
              label: "Designer",
              value: "designer",
            },
            {
              label: "Manager",
              value: "manager",
            },
          ],
        },

        {
          id: "f11",
          span: 10,
          offset: 1,
          type: "slider",
          label: "Years of Experience",
          defaultValue: 3,
        },
      ],

      [
        {
          id: "f12",
          span: 20,
          offset: 2,
          type: "checkbox",
          label: "Skills",
          defaultValue: ["react", "node"],
          options: [
            {
              label: "React",
              value: "react",
            },
            {
              label: "Node.js",
              value: "node",
            },
            {
              label: "Go",
              value: "go",
            },
            {
              label: "Docker",
              value: "docker",
            },
          ],
        },
      ],

      [
        {
          id: "f13",
          span: 20,
          offset: 2,
          type: "url",
          label: "Portfolio URL",
          placeholder: "https://portfolio.com",
        },
      ],

      [
        {
          id: "div3",
          span: 24,
          offset: 0,
          type: "divider",
        },
      ],

      [
        {
          id: "h4",
          span: 24,
          offset: 0,
          type: "heading",
          label: "4. Team Information",
        },
      ],

      [
        {
          id: "f14",
          span: 6,
          offset: 1,
          type: "toggle",
          label: "Manage a Team?",
          defaultValue: true,
        },

        {
          id: "f15",
          span: 6,
          offset: 1,
          type: "number",
          label: "Team Size",
          defaultValue: 5,
          conditions: [
            {
              field: "f14",
              operator: "equals",
              value: true,
            },
          ],
        },

        {
          id: "f16",
          span: 6,
          offset: 1,
          type: "text",
          label: "Your Role",
          placeholder: "Team Lead",
          conditions: [
            {
              field: "f14",
              operator: "equals",
              value: true,
            },
          ],
        },
      ],

      [
        {
          id: "div4",
          span: 24,
          offset: 0,
          type: "divider",
        },
      ],

      [
        {
          id: "h5",
          span: 24,
          offset: 0,
          type: "heading",
          label: "5. Media Uploads",
        },
      ],

      [
        {
          id: "f17",
          span: 10,
          offset: 1,
          type: "file",
          label: "Upload Profile Image",
        },

        {
          id: "f18",
          span: 10,
          offset: 1,
          type: "file",
          label: "Upload Resume",
        },
      ],

      [
        {
          id: "div5",
          span: 24,
          offset: 0,
          type: "divider",
        },
      ],

      [
        {
          id: "h6",
          span: 24,
          offset: 0,
          type: "heading",
          label: "6. Preferences",
        },
      ],

      [
        {
          id: "f19",
          span: 10,
          offset: 1,
          type: "checkbox",
          label: "Notifications",
          defaultValue: ["email"],
          options: [
            {
              label: "Email",
              value: "email",
            },
            {
              label: "SMS",
              value: "sms",
            },
            {
              label: "Push",
              value: "push",
            },
          ],
        },

        {
          id: "f20",
          span: 4,
          offset: 1,
          type: "select",
          label: "Theme",
          defaultValue: "dark",
          options: [
            {
              label: "Light",
              value: "light",
            },
            {
              label: "Dark",
              value: "dark",
            },
          ],
        },

        {
          id: "f21",
          span: 4,
          offset: 1,
          type: "select",
          label: "Language",
          defaultValue: "en",
          options: [
            {
              label: "English",
              value: "en",
            },
            {
              label: "Hindi",
              value: "hi",
            },
            {
              label: "Spanish",
              value: "es",
            },
          ],
        },
      ],

      [
        {
          id: "f22",
          span: 20,
          offset: 2,
          type: "textarea",
          label: "Short Bio",
          placeholder: "Tell us about yourself...",
        },
      ],

      [
        {
          id: "f23",
          span: 10,
          offset: 1,
          type: "rating",
          label: "Experience Rating",
          defaultValue: 5,
        },

        {
          id: "f24",
          span: 10,
          offset: 1,
          type: "date",
          label: "Preferred Meeting Date",
          defaultValue: "2026-06-15",
        },
      ],

      [
        {
          id: "div6",
          span: 24,
          offset: 0,
          type: "divider",
        },
      ],
      [
        {
          id: "h7",
          span: 24,
          offset: 0,
          type: "heading",
          label: "7. Advanced Pickers",
        },
      ],
      [
        {
          id: "f25",
          span: 6,
          offset: 1,
          type: "cascader",
          label: "Cascader",
          options: [
            {
              value: "zhejiang",
              label: "Zhejiang",
              children: [
                {
                  value: "hangzhou",
                  label: "Hangzhou",
                },
              ],
            },
          ],
        },
        {
          id: "f26",
          span: 6,
          offset: 1,
          type: "treeselect",
          label: "Tree Select",
          options: [
            {
              value: "parent 1",
              title: "parent 1",
              children: [
                {
                  value: "leaf 1",
                  title: "leaf 1",
                },
              ],
            },
          ],
        },
      ],
      [
        {
          id: "f27",
          span: 10,
          offset: 1,
          type: "daterange",
          label: "Date Range",
        },
        {
          id: "f28",
          span: 10,
          offset: 1,
          type: "timerange",
          label: "Time Range",
        },
      ],
      [
        {
          id: "div7",
          span: 24,
          offset: 0,
          type: "divider",
        },
      ],
      [
        {
          id: "h8",
          span: 24,
          offset: 0,
          type: "heading",
          label: "8. Data Visualization (Charts)",
        },
      ],
      [
        {
          id: "f29",
          span: 11,
          offset: 1,
          type: "chart",
          label: "Revenue (Bar Chart)",
          chartConfig: {
            type: "bar",
            labelsKey: "month",
            height: 300,
            data: [
              { month: "Jan", revenue: 4500 },
              { month: "Feb", revenue: 5200 },
              { month: "Mar", revenue: 6100 },
              { month: "Apr", revenue: 4800 },
              { month: "May", revenue: 7000 }
            ],
            datasets: [
              {
                label: "Monthly Revenue",
                dataKey: "revenue",
                backgroundColor: "#3b82f6"
              }
            ]
          }
        },
        {
          id: "f30",
          span: 11,
          offset: 0,
          type: "chart",
          label: "Growth (Line + Bar Mixed)",
          chartConfig: {
            type: "bar",
            labelsKey: "month",
            height: 300,
            data: [
              { month: "Jan", users: 100, growth: 10 },
              { month: "Feb", users: 150, growth: 50 },
              { month: "Mar", users: 200, growth: 50 },
              { month: "Apr", users: 300, growth: 100 }
            ],
            datasets: [
              {
                label: "New Users",
                dataKey: "users",
                backgroundColor: "#10b981"
              },
              {
                label: "Growth Rate",
                dataKey: "growth",
                type: "line",
                borderColor: "#f59e0b",
                tension: 0.4
              }
            ]
          }
        }
      ],
      [
        {
          id: "f31",
          span: 11,
          offset: 1,
          type: "chart",
          label: "Market Share (Doughnut)",
          chartConfig: {
            type: "doughnut",
            labelsKey: "platform",
            height: 300,
            data: [
              { platform: "iOS", share: 45 },
              { platform: "Android", share: 40 },
              { platform: "Web", share: 15 }
            ],
            datasets: [
              {
                label: "Platform Share",
                dataKey: "share",
                backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"]
              }
            ]
          }
        },
        {
          id: "f32",
          span: 11,
          offset: 0,
          type: "chart",
          label: "Quick Chart from Options",
          chartConfig: {
            type: "pie",
          },
          options: [
            { label: "Product A", value: 300 },
            { label: "Product B", value: 200 },
            { label: "Product C", value: 500 }
          ]
        }
      ],
      [
        {
          id: "f34",
          span: 11,
          offset: 1,
          type: "chart",
          label: "Performance Metrics (Radar)",
          chartConfig: {
            type: "radar",
            labelsKey: "metric",
            height: 350,
            data: [
              { metric: "Speed", app1: 85, app2: 65 },
              { metric: "Reliability", app1: 90, app2: 75 },
              { metric: "Comfort", app1: 70, app2: 80 },
              { metric: "Safety", app1: 95, app2: 85 },
              { metric: "Efficiency", app1: 80, app2: 90 }
            ],
            datasets: [
              {
                label: "App 1",
                dataKey: "app1",
                backgroundColor: "rgba(59, 130, 246, 0.4)",
                borderColor: "#3b82f6",
                fill: true
              },
              {
                label: "App 2",
                dataKey: "app2",
                backgroundColor: "rgba(16, 185, 129, 0.4)",
                borderColor: "#10b981",
                fill: true
              }
            ]
          }
        },
        {
          id: "f35",
          span: 11,
          offset: 0,
          type: "chart",
          label: "Audience Demographics (Polar Area)",
          chartConfig: {
            type: "polarArea",
            labelsKey: "ageGroup",
            height: 350,
            data: [
              { ageGroup: "18-24", count: 11 },
              { ageGroup: "25-34", count: 16 },
              { ageGroup: "35-44", count: 7 },
              { ageGroup: "45-54", count: 3 },
              { ageGroup: "55+", count: 14 }
            ],
            datasets: [
              {
                label: "Users",
                dataKey: "count",
                backgroundColor: [
                  "rgba(59, 130, 246, 0.6)",
                  "rgba(16, 185, 129, 0.6)",
                  "rgba(245, 158, 11, 0.6)",
                  "rgba(239, 68, 68, 0.6)",
                  "rgba(139, 92, 246, 0.6)"
                ]
              }
            ]
          }
        }
      ],
      [
        {
          id: "f36",
          span: 11,
          offset: 1,
          type: "chart",
          label: "Correlation (Scatter)",
          chartConfig: {
            type: "scatter",
            height: 300,
            options: {
              scales: { x: { type: 'linear', position: 'bottom' } }
            },
            data: [
              { point: { x: -10, y: 0 } },
              { point: { x: 0, y: 10 } },
              { point: { x: 10, y: 5 } },
              { point: { x: 0.5, y: 5.5 } }
            ],
            datasets: [
              {
                label: "Scatter Dataset",
                dataKey: "point",
                backgroundColor: "#ec4899"
              }
            ]
          }
        },
        {
          id: "f37",
          span: 11,
          offset: 0,
          type: "chart",
          label: "Traffic Trends (Area Chart)",
          chartConfig: {
            type: "line",
            labelsKey: "day",
            height: 300,
            data: [
              { day: "Mon", visitors: 120 },
              { day: "Tue", visitors: 190 },
              { day: "Wed", visitors: 300 },
              { day: "Thu", visitors: 500 },
              { day: "Fri", visitors: 200 }
            ],
            datasets: [
              {
                label: "Unique Visitors",
                dataKey: "visitors",
                backgroundColor: "rgba(6, 182, 212, 0.3)",
                borderColor: "#06b6d4",
                fill: true,
                tension: 0.4
              }
            ]
          }
        }
      ],
      [
        {
          id: "f38",
          span: 11,
          offset: 1,
          type: "chart",
          label: "Server Load (Stepped Line)",
          chartConfig: {
            type: "line",
            labelsKey: "time",
            height: 300,
            data: [
              { time: "10:00", load: 20 },
              { time: "10:05", load: 20 },
              { time: "10:10", load: 60 },
              { time: "10:15", load: 60 },
              { time: "10:20", load: 40 }
            ],
            datasets: [
              {
                label: "CPU Load %",
                dataKey: "load",
                borderColor: "#f43f5e",
                stepped: true
              }
            ]
          }
        },
        {
          id: "f39",
          span: 11,
          offset: 0,
          type: "chart",
          label: "Team Capacity (Stacked Bar)",
          chartConfig: {
            type: "bar",
            labelsKey: "team",
            height: 300,
            options: {
              scales: {
                x: { stacked: true },
                y: { stacked: true }
              }
            },
            data: [
              { team: "Frontend", dev: 10, qa: 3, design: 2 },
              { team: "Backend", dev: 15, qa: 4, design: 0 },
              { team: "Mobile", dev: 8, qa: 2, design: 1 }
            ],
            datasets: [
              { label: "Developers", dataKey: "dev", backgroundColor: "#3b82f6" },
              { label: "QA Engineers", dataKey: "qa", backgroundColor: "#10b981" },
              { label: "Designers", dataKey: "design", backgroundColor: "#f59e0b" }
            ]
          }
        }
      ],
      [
        {
          id: "f40",
          span: 11,
          offset: 1,
          type: "chart",
          label: "Project Timeline (Floating Bar)",
          chartConfig: {
            type: "bar",
            labelsKey: "phase",
            height: 300,
            options: { indexAxis: 'y' },
            data: [
              { phase: "Planning", duration: [0, 5] },
              { phase: "Development", duration: [5, 15] },
              { phase: "Testing", duration: [15, 20] }
            ],
            datasets: [
              {
                label: "Phase Duration (Days)",
                dataKey: "duration",
                backgroundColor: "#8b5cf6"
              }
            ]
          }
        },
        {
          id: "f41",
          span: 11,
          offset: 0,
          type: "chart",
          label: "Satisfaction Score (Half Doughnut)",
          chartConfig: {
            type: "doughnut",
            labelsKey: "rating",
            height: 300,
            options: {
              rotation: -90,
              circumference: 180
            },
            data: [
              { rating: "Detractors", count: 10 },
              { rating: "Passives", count: 20 },
              { rating: "Promoters", count: 70 }
            ],
            datasets: [
              {
                label: "NPS",
                dataKey: "count",
                backgroundColor: ["#ef4444", "#f59e0b", "#10b981"]
              }
            ]
          }
        }
      ],
      [
        {
          id: "f42",
          span: 11,
          offset: 1,
          type: "chart",
          label: "Investment Portfolio (Bubble)",
          chartConfig: {
            type: "bubble",
            height: 300,
            data: [
              { tech: { x: 20, y: 30, r: 15 }, realEstate: { x: 10, y: 40, r: 25 } },
              { tech: { x: 40, y: 10, r: 10 }, realEstate: { x: 30, y: 20, r: 30 } },
              { tech: { x: 25, y: 25, r: 20 }, realEstate: null }
            ],
            datasets: [
              {
                label: "Tech Stocks",
                dataKey: "tech",
                backgroundColor: "rgba(59, 130, 246, 0.5)"
              },
              {
                label: "Real Estate",
                dataKey: "realEstate",
                backgroundColor: "rgba(16, 185, 129, 0.5)"
              }
            ]
          }
        },
        {
          id: "f43",
          span: 11,
          offset: 0,
          type: "chart",
          label: "Regional Sales (Horizontal Bar)",
          chartConfig: {
            type: "bar",
            labelsKey: "region",
            height: 300,
            options: {
              indexAxis: 'y',
            },
            data: [
              { region: "North America", sales: 12000 },
              { region: "Europe", sales: 9500 },
              { region: "Asia", sales: 15000 },
              { region: "South America", sales: 4200 }
            ],
            datasets: [
              {
                label: "Sales ($)",
                dataKey: "sales",
                backgroundColor: "#6366f1"
              }
            ]
          }
        }
      ],
      [
        {
          id: "f44",
          span: 22,
          offset: 1,
          type: "chart",
          label: "Dual Axis Analysis (Multi-Axis Line)",
          chartConfig: {
            type: "line",
            labelsKey: "month",
            height: 350,
            options: {
              scales: {
                y: { type: 'linear', display: true, position: 'left' },
                y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
              }
            },
            data: [
              { month: "Jan", temp: 5, sales: 100 },
              { month: "Feb", temp: 8, sales: 120 },
              { month: "Mar", temp: 15, sales: 200 },
              { month: "Apr", temp: 22, sales: 250 },
              { month: "May", temp: 28, sales: 300 }
            ],
            datasets: [
              {
                label: "Temperature (°C)",
                dataKey: "temp",
                borderColor: "#ef4444",
                yAxisID: "y"
              },
              {
                label: "Ice Cream Sales ($)",
                dataKey: "sales",
                borderColor: "#3b82f6",
                yAxisID: "y1"
              }
            ]
          }
        }
      ],
      [
        {
          id: "f33",
          span: 0,
          offset: 0,
          type: "hidden",
          name: "hidden_metadata",
          defaultValue: "secret_123"
        }
      ],
      [
        {
          id: "p1",
          span: 20,
          offset: 2,
          type: "paragraph",
          label:
            "This dataset includes validation, uploads, sliders, ratings, conditional rendering, multiple field types, and advanced charts for testing.",
        },
      ],
    ],
  };

  const initialValues = useMemo(() => {
    return getInitialValues(formSchema.rows as any);
  }, [formSchema.rows]);

  const dynamicZodSchema = useMemo(() => {
    return generateZodSchema(formSchema.rows as any);
  }, [formSchema.rows]);

  const methods = useForm({
    defaultValues: initialValues,
    resolver: zodResolver(dynamicZodSchema),
    mode: "onBlur",
  });

  const handleFormSubmit = methods.handleSubmit(
    (_data) => {
      alert("Form submitted successfully Check console for data.");
    },
    (_errors) => {
    }
  );

  if (loading) {
    return (
      <div className="w-full bg-secondary h-full p-8 flex flex-col gap-8">
        <Skeleton active title paragraph={{ rows: 4 }} />
        <Skeleton active title paragraph={{ rows: 4 }} />
        <Skeleton active title paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleFormSubmit} className="w-full bg-secondary h-full p-4 flex flex-col gap-4">
        <DynamicFields rows={formSchema?.rows as any} methods={methods} />

        <div className="flex justify-end mt-4 px-8 pb-8">
          <ButtonField htmlType="submit" className="bg-primary text-white px-8 py-2 rounded-md font-bold hover:bg-primary-hover">
            Submit Form
          </ButtonField>
        </div>
      </form>
    </FormProvider>
  );
};

export default DynamicForm;
