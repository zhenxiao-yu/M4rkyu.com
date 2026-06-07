import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getDbProducts } from "@/lib/shop/db";
import { formatPrice } from "@/lib/shop/format";
import {
  bulkDeleteProductsAction,
  bulkSetProductStatusAction,
  duplicateProductAction,
  reorderProductAction,
  setProductStatusAction,
} from "@/lib/shop/admin";
import { AdminPageHeader } from "../_components/admin-page-header";
import { AdminList, type AdminListItem } from "@/components/admin/admin-list";

export const dynamic = "force-dynamic";

export default async function AdminShopPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const [t, tAdmin, productList] = await Promise.all([
    getTranslations({ locale, namespace: "AdminShop" }),
    getTranslations({ locale, namespace: "Admin" }),
    getDbProducts(),
  ]);

  const items: AdminListItem[] = productList.map((product) => ({
    id: product.id,
    slug: product.slug,
    title: product.title,
    status: product.status,
    badges: [
      product.kind,
      formatPrice(product.price_in_cents, locale, "usd"),
      ...(product.in_stock ? [] : [t("outOfStock")]),
    ],
    subtitle: product.summary || undefined,
    viewHref:
      product.status === "ready"
        ? `/${locale}/shop/${product.slug}`
        : undefined,
  }));

  const statusOptions = [
    { value: "ready", label: t("status.ready") },
    { value: "draft", label: t("status.draft") },
    { value: "placeholder", label: t("status.placeholder") },
    { value: "coming-soon", label: t("status.comingSoon") },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow={tAdmin("eyebrow")}
        title={t("title")}
        description={t("description")}
      />
      <AdminList
          items={items}
          locale={locale}
          editBase="/admin/shop"
          newHref="/admin/shop/new"
          statusOptions={statusOptions}
          setStatusAction={setProductStatusAction}
          reorderAction={reorderProductAction}
          duplicateAction={duplicateProductAction}
          bulkStatusAction={bulkSetProductStatusAction}
          bulkDeleteAction={bulkDeleteProductsAction}
          labels={{
            searchPlaceholder: tAdmin("list.search"),
            statusAll: tAdmin("list.allStatuses"),
            edit: t("edit"),
            view: tAdmin("list.view"),
            duplicate: tAdmin("list.duplicate"),
            moveUp: tAdmin("list.moveUp"),
            moveDown: tAdmin("list.moveDown"),
            statusAria: tAdmin("list.status"),
            noMatches: tAdmin("list.noMatches"),
            results: tAdmin("list.results"),
            newLabel: t("newProduct"),
            countLabel: t("count", { count: items.length }),
            emptyTitle: t("emptyTitle"),
            emptyDescription: t("emptyDescription"),
          }}
        />
    </>
  );
}
