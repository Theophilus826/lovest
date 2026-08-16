
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  DollarSign,
  Download,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  icon: React.ReactNode;
}

function MetricCard({
  title,
  value,
  change,
  positive = true,
  icon,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${
            positive
              ? "text-emerald-600"
              : "text-red-600"
          }`}
        >
          {positive ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}

          {change}
        </span>

        <span className="text-xs text-slate-400">
          vs previous period
        </span>
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      {/* =====================================
          HEADER
      ====================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <BarChart3 size={16} />
            <span>Reports</span>
            <span>/</span>
            <span className="text-slate-900">
              Analytics
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Analytics
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Understand your store performance and customer activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <CalendarDays size={17} />
            Last 30 days
          </button>

          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Download size={17} />
            Export report
          </button>
        </div>
      </div>

      {/* =====================================
          METRICS
      ====================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value="$48,290"
          change="+12.5%"
          icon={<DollarSign size={21} />}
        />

        <MetricCard
          title="Total Orders"
          value="1,284"
          change="+8.2%"
          icon={<ShoppingCart size={21} />}
        />

        <MetricCard
          title="Customers"
          value="8,549"
          change="+14.4%"
          icon={<Users size={21} />}
        />

        <MetricCard
          title="Average Order"
          value="$37.60"
          change="+4.8%"
          icon={<TrendingUp size={21} />}
        />
      </div>

      {/* =====================================
          REVENUE CHART
      ====================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Revenue overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Revenue and orders over the selected period.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
              Revenue
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              Orders
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Chart area */}

          <div className="relative h-80">
            {/* Horizontal grid */}

            <div className="absolute inset-0 flex flex-col justify-between">
              {[100, 75, 50, 25, 0].map(
                (value) => (
                  <div
                    key={value}
                    className="flex items-center gap-3"
                  >
                    <span className="w-10 text-right text-xs text-slate-400">
                      {value === 0
                        ? "$0"
                        : `$${value / 10}k`}
                    </span>

                    <div className="h-px flex-1 bg-slate-100" />
                  </div>
                )
              )}
            </div>

            {/* Bars */}

            <div className="absolute bottom-7 left-14 right-0 top-3 flex items-end gap-2 sm:gap-4">
              {[
                42, 55, 48, 68, 61, 74, 58, 82, 71,
                88, 76, 94,
              ].map((height, index) => (
                <div
                  key={index}
                  className="flex h-full flex-1 items-end"
                >
                  <div
                    className="w-full rounded-t-lg bg-slate-900 transition hover:bg-slate-700"
                    style={{
                      height: `${height}%`,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* X axis */}

            <div className="absolute bottom-0 left-14 right-0 flex justify-between">
              {[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ].map((month) => (
                <span
                  key={month}
                  className="text-[10px] text-slate-400 sm:text-xs"
                >
                  {month}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================
          PERFORMANCE GRID
      ====================================== */}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* SALES BY CATEGORY */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-semibold text-slate-900">
              Sales by category
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Revenue contribution by category.
            </p>
          </div>

          <div className="space-y-5 p-6">
            <CategoryStat
              name="Electronics"
              revenue="$18,420"
              percentage="38%"
              width="38%"
            />

            <CategoryStat
              name="Fashion"
              revenue="$12,840"
              percentage="27%"
              width="27%"
            />

            <CategoryStat
              name="Home & Living"
              revenue="$8,620"
              percentage="18%"
              width="18%"
            />

            <CategoryStat
              name="Beauty"
              revenue="$5,140"
              percentage="11%"
              width="11%"
            />

            <CategoryStat
              name="Sports"
              revenue="$3,270"
              percentage="6%"
              width="6%"
            />
          </div>
        </section>

        {/* CUSTOMER PERFORMANCE */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-semibold text-slate-900">
              Customer performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              New and returning customer activity.
            </p>
          </div>

          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <CustomerMetric
                title="New customers"
                value="2,840"
                change="+18.2%"
                positive
              />

              <CustomerMetric
                title="Returning customers"
                value="5,709"
                change="+9.4%"
                positive
              />

              <CustomerMetric
                title="Repeat purchase rate"
                value="42.8%"
                change="+3.6%"
                positive
              />

              <CustomerMetric
                title="Customer retention"
                value="76.4%"
                change="-2.1%"
                positive={false}
              />
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Customer growth
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Compared with the previous period.
                  </p>
                </div>

                <Users
                  size={20}
                  className="text-slate-400"
                />
              </div>

              <div className="mt-5 flex h-20 items-end gap-2">
                {[35, 42, 38, 52, 48, 64, 58, 71, 67, 82].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t-md bg-slate-900"
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================
          PRODUCT PERFORMANCE
      ====================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-slate-900">
              Product performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your best performing products.
            </p>
          </div>

          <Package
            size={19}
            className="text-slate-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Units sold
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Revenue
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Growth
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Performance
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              <ProductRow
                product="Wireless Headphones"
                units="248"
                revenue="$12,450"
                growth="+18.4%"
                width="88%"
              />

              <ProductRow
                product="Premium Sneakers"
                units="186"
                revenue="$9,840"
                growth="+14.2%"
                width="74%"
              />

              <ProductRow
                product="Smart Watch Pro"
                units="154"
                revenue="$8,230"
                growth="+11.8%"
                width="65%"
              />

              <ProductRow
                product="Leather Backpack"
                units="129"
                revenue="$6,750"
                growth="+8.6%"
                width="54%"
              />

              <ProductRow
                product="Classic T-Shirt"
                units="118"
                revenue="$4,920"
                growth="+5.4%"
                width="47%"
              />
            </tbody>
          </table>
        </div>
      </section>

      {/* =====================================
          CONVERSION & SUMMARY
      ====================================== */}

      <div className="grid gap-6 md:grid-cols-3">
        <SummaryCard
          title="Conversion rate"
          value="4.82%"
          change="+0.72%"
          description="Visitors who completed a purchase."
          icon={<TrendingUp size={20} />}
        />

        <SummaryCard
          title="Cart abandonment"
          value="21.4%"
          change="-3.2%"
          description="Customers who left items in their cart."
          icon={<ShoppingCart size={20} />}
          positive
        />

        <SummaryCard
          title="Inventory value"
          value="$128,420"
          change="+6.8%"
          description="Current estimated inventory value."
          icon={<Package size={20} />}
        />
      </div>
    </div>
  );
}

/* =========================================
   CATEGORY STAT
========================================= */

function CategoryStat({
  name,
  revenue,
  percentage,
  width,
}: {
  name: string;
  revenue: string;
  percentage: string;
  width: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          {name}
        </span>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-900">
            {revenue}
          </span>

          <span className="w-8 text-right text-xs text-slate-400">
            {percentage}
          </span>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900"
          style={{ width }}
        />
      </div>
    </div>
  );
}

/* =========================================
   CUSTOMER METRIC
========================================= */

function CustomerMetric({
  title,
  value,
  change,
  positive,
}: {
  title: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>

      <div
        className={`mt-2 flex items-center gap-1 text-xs font-semibold ${
          positive
            ? "text-emerald-600"
            : "text-red-600"
        }`}
      >
        {positive ? (
          <ArrowUpRight size={13} />
        ) : (
          <ArrowDownRight size={13} />
        )}

        {change}
      </div>
    </div>
  );
}

/* =========================================
   PRODUCT ROW
========================================= */

function ProductRow({
  product,
  units,
  revenue,
  growth,
  width,
}: {
  product: string;
  units: string;
  revenue: string;
  growth: string;
  width: string;
}) {
  return (
    <tr className="transition hover:bg-slate-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Package size={18} />
          </div>

          <span className="text-sm font-semibold text-slate-900">
            {product}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-slate-600">
        {units}
      </td>

      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
        {revenue}
      </td>

      <td className="px-6 py-4">
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
          <ArrowUpRight size={14} />
          {growth}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-900"
              style={{ width }}
            />
          </div>

          <span className="text-xs font-medium text-slate-400">
            {width}
          </span>
        </div>
      </td>
    </tr>
  );
}

/* =========================================
   SUMMARY CARD
========================================= */

function SummaryCard({
  title,
  value,
  change,
  description,
  icon,
  positive = true,
}: {
  title: string;
  value: string;
  change: string;
  description: string;
  icon: React.ReactNode;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">
          {title}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-end gap-3">
        <p className="text-2xl font-bold text-slate-900">
          {value}
        </p>

        <span
          className={`mb-1 flex items-center gap-1 text-xs font-semibold ${
            positive
              ? "text-emerald-600"
              : "text-red-600"
          }`}
        >
          {positive ? (
            <ArrowUpRight size={13} />
          ) : (
            <ArrowDownRight size={13} />
          )}

          {change}
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

