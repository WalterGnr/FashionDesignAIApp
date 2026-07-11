from io import BytesIO
from typing import Any
from xml.sax.saxutils import escape

import xlsxwriter
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

PDF_CONTENT_TYPE = "application/pdf"
XLSX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
SHEET_NAMES = [
    "Overview",
    "Measurements",
    "Bill of Materials",
    "Colorways",
    "Construction Notes",
    "Warnings",
    "Revision Log",
]


def _text(value: Any, fallback: str = "Not specified") -> str:
    if value is None or value == "" or value == "unknown":
        return fallback
    if isinstance(value, bool):
        return "Yes" if value else "No"
    if isinstance(value, list):
        return ", ".join(_text(item, "") for item in value) or fallback
    return str(value).replace("_", " ")


def _paragraph(value: Any, style: ParagraphStyle) -> Paragraph:
    return Paragraph(escape(_text(value)), style)


class NumberedCanvas(Canvas):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        kwargs["invariant"] = 1
        super().__init__(*args, **kwargs)
        self._saved_pages: list[dict[str, Any]] = []

    def showPage(self) -> None:  # noqa: N802
        self._saved_pages.append(dict(self.__dict__))
        self._startPage()

    def save(self) -> None:
        page_count = len(self._saved_pages)
        for page_number, page in enumerate(self._saved_pages, start=1):
            self.__dict__.update(page)
            self.setFillColor(colors.HexColor("#5E625F"))
            self.setFont("Helvetica", 8)
            self.drawString(0.55 * inch, 0.35 * inch, "Fashion Design AI | Production Tech Pack")
            self.drawRightString(self._pagesize[0] - 0.55 * inch, 0.35 * inch, f"Page {page_number} of {page_count}")
            super().showPage()
        super().save()


def _pdf_table(rows: list[list[Any]], widths: list[float], body: ParagraphStyle, header: ParagraphStyle) -> Table:
    rendered = [[_paragraph(cell, header if index == 0 else body) for cell in row] for index, row in enumerate(rows)]
    table = Table(rendered, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#27302D")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#C9CECB")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F7F5F1")),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def render_pdf(snapshot: dict[str, Any], issues: list[dict[str, Any]], page_size: str) -> bytes:
    output = BytesIO()
    pagesize = A4 if page_size == "a4" else letter
    document = SimpleDocTemplate(
        output,
        pagesize=pagesize,
        leftMargin=0.55 * inch,
        rightMargin=0.55 * inch,
        topMargin=0.55 * inch,
        bottomMargin=0.55 * inch,
        title=f"{snapshot['design']['name']} Production Tech Pack",
        author="Fashion Design AI",
        subject=f"Dress design version {snapshot['version']['version_number']}",
    )
    base = getSampleStyleSheet()
    title = ParagraphStyle(
        "TPTitle",
        parent=base["Title"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#27302D"),
        alignment=TA_CENTER,
        spaceAfter=12,
    )
    heading = ParagraphStyle(
        "TPHeading",
        parent=base["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=17,
        textColor=colors.HexColor("#27302D"),
        spaceBefore=10,
        spaceAfter=7,
        keepWithNext=1,
    )
    body = ParagraphStyle(
        "TPBody",
        parent=base["BodyText"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#202522"),
    )
    small = ParagraphStyle("TPSmall", parent=body, fontSize=7.5, leading=9)
    header = ParagraphStyle("TPHeader", parent=body, fontName="Helvetica-Bold", textColor=colors.white)
    warning = ParagraphStyle(
        "TPWarning",
        parent=body,
        textColor=colors.HexColor("#8A3E2B"),
        borderColor=colors.HexColor("#D4A08F"),
        borderWidth=0.6,
        borderPadding=7,
        backColor=colors.HexColor("#FFF5F1"),
    )
    story: list[Any] = []
    design = snapshot["design"]
    version = snapshot["version"]
    overview = snapshot["overview"]

    story.extend(
        [
            Spacer(1, 0.8 * inch),
            Paragraph("PRODUCTION TECH PACK", title),
            _paragraph(design["name"], ParagraphStyle("DesignName", parent=heading, alignment=TA_CENTER, fontSize=18)),
            Spacer(1, 0.15 * inch),
            _pdf_table(
                [
                    ["Document", "Value"],
                    ["Garment category", "Dress"],
                    ["Design ID", design["id"]],
                    ["Version", version["version_number"]],
                    ["Version ID", version["id"]],
                    ["Readiness", snapshot["readiness_status"].replace("_", " ").upper()],
                    ["Snapshot hash", snapshot["snapshot_hash"]],
                ],
                [1.65 * inch, pagesize[0] - 2.75 * inch],
                body,
                header,
            ),
            Spacer(1, 0.25 * inch),
            Paragraph(
                "This document is generated from an immutable dress specification snapshot. "
                "Unknown values remain blank or explicitly not specified.",
                small,
            ),
            PageBreak(),
            Paragraph("Design Summary", heading),
            _pdf_table(
                [["Field", "Value"]] + [[row["label"], row["value"]] for row in overview],
                [2.0 * inch, pagesize[0] - 3.1 * inch],
                body,
                header,
            ),
        ]
    )

    for section_title, key, columns, widths in [
        (
            "Garment Details",
            "details",
            ["Field", "Value", "Status"],
            [1.8 * inch, pagesize[0] - 4.2 * inch, 1.3 * inch],
        ),
        (
            "Materials",
            "materials",
            ["Component", "Attribute", "Value"],
            [1.35 * inch, 1.6 * inch, pagesize[0] - 4.05 * inch],
        ),
        (
            "Measurements",
            "measurements",
            ["Point of measure", "Value", "Unit", "Status", "Note"],
            [1.55 * inch, 0.7 * inch, 0.6 * inch, 1.0 * inch, pagesize[0] - 4.95 * inch],
        ),
    ]:
        story.append(Paragraph(section_title, heading))
        rows = [columns] + [
            [row.get(column.lower().replace(" ", "_"), "") for column in columns] for row in snapshot[key]
        ]
        story.append(_pdf_table(rows, widths, body, header))

    story.append(Paragraph("Construction and Pattern Notes", heading))
    notes = snapshot["construction_notes"] + snapshot["pattern_notes"]
    note_rows = [["Type", "Note", "Status"]] + [[item["type"], item["text"], item["status"]] for item in notes]
    story.append(_pdf_table(note_rows, [1.2 * inch, pagesize[0] - 3.6 * inch, 1.3 * inch], body, header))

    story.append(Paragraph("Readiness, Assumptions, and Warnings", heading))
    if issues:
        for item in issues:
            story.append(
                Paragraph(
                    f"<b>{escape(item['severity'].upper())}: {escape(item['code'])}</b><br/>{escape(item['message'])}",
                    warning,
                )
            )
            story.append(Spacer(1, 5))
    else:
        story.append(Paragraph("No export readiness issues were recorded.", body))
    for item in snapshot["assumptions"]:
        story.append(_paragraph(f"Assumption: {item}", body))

    story.append(Paragraph("Revision History", heading))
    revision_rows = [["Version", "Created", "Source", "Change summary"]] + [
        [row["version_number"], row["created_at"], row["source"], row["change_summary"]]
        for row in snapshot["revision_history"]
    ]
    story.append(
        _pdf_table(revision_rows, [0.7 * inch, 1.3 * inch, 1.0 * inch, pagesize[0] - 4.1 * inch], body, header)
    )

    if snapshot.get("visual_reference"):
        story.append(Paragraph("Visual Reference", heading))
        story.append(Paragraph("Concept reference only - not a pattern or fit approval.", warning))

    document.build(story, canvasmaker=NumberedCanvas)
    return output.getvalue()


def render_xlsx(snapshot: dict[str, Any], issues: list[dict[str, Any]]) -> bytes:
    output = BytesIO()
    workbook = xlsxwriter.Workbook(
        output,
        {"in_memory": True, "strings_to_formulas": False, "strings_to_urls": False},
    )
    workbook.read_only_recommended()
    workbook.set_properties(
        {
            "title": f"{snapshot['design']['name']} Production Tech Pack",
            "subject": f"Dress version {snapshot['version']['version_number']}",
            "author": "Fashion Design AI",
            "comments": f"Immutable snapshot {snapshot['snapshot_hash']}",
        }
    )
    title_format = workbook.add_format({"bold": True, "font_size": 18, "font_color": "#27302D"})
    header_format = workbook.add_format(
        {"bold": True, "font_color": "#FFFFFF", "bg_color": "#27302D", "border": 1, "border_color": "#AEB5B1"}
    )
    text_format = workbook.add_format({"text_wrap": True, "valign": "top", "border": 1, "border_color": "#D5D9D7"})
    number_format = workbook.add_format({"num_format": "0.00", "valign": "top", "border": 1, "border_color": "#D5D9D7"})
    warning_format = workbook.add_format(
        {"text_wrap": True, "valign": "top", "border": 1, "bg_color": "#FFF1EB", "font_color": "#8A3E2B"}
    )

    def setup_sheet(name: str, widths: list[int]) -> Any:
        sheet = workbook.add_worksheet(name)
        sheet.hide_gridlines(2)
        sheet.freeze_panes(2, 0)
        sheet.set_landscape()
        sheet.fit_to_pages(1, 0)
        sheet.set_margins(0.3, 0.3, 0.5, 0.5)
        for index, width in enumerate(widths):
            sheet.set_column(index, index, width)
        sheet.write_string(0, 0, name, title_format)
        return sheet

    def write_table(
        sheet: Any, headers: list[str], rows: list[list[Any]], numeric_columns: set[int] | None = None
    ) -> None:
        numeric_columns = numeric_columns or set()
        for column, label in enumerate(headers):
            sheet.write_string(1, column, label, header_format)
        for row_index, row in enumerate(rows, start=2):
            for column, value in enumerate(row):
                if column in numeric_columns and isinstance(value, (int, float)) and not isinstance(value, bool):
                    sheet.write_number(row_index, column, value, number_format)
                elif value is None or value == "":
                    sheet.write_blank(row_index, column, None, text_format)
                else:
                    sheet.write_string(row_index, column, _text(value, ""), text_format)
        if rows:
            sheet.autofilter(1, 0, len(rows) + 1, len(headers) - 1)
            sheet.print_area(0, 0, len(rows) + 1, len(headers) - 1)
        sheet.repeat_rows(0, 1)

    overview = setup_sheet("Overview", [24, 54])
    overview_rows = [
        ["Design name", snapshot["design"]["name"]],
        ["Design ID", snapshot["design"]["id"]],
        ["Version", snapshot["version"]["version_number"]],
        ["Version ID", snapshot["version"]["id"]],
        ["Readiness", snapshot["readiness_status"]],
        ["Snapshot hash", snapshot["snapshot_hash"]],
    ] + [[row["label"], row["value"]] for row in snapshot["overview"]]
    write_table(overview, ["Field", "Value"], overview_rows)

    measurements = setup_sheet("Measurements", [28, 14, 12, 18, 46])
    write_table(
        measurements,
        ["Point of measure", "Value", "Unit", "Status", "Note"],
        [
            [row["point_of_measure"], row["value"], row["unit"], row["status"], row["note"]]
            for row in snapshot["measurements"]
        ],
        {1},
    )

    materials = setup_sheet("Bill of Materials", [18, 24, 34, 16])
    write_table(
        materials,
        ["Component", "Attribute", "Value", "Status"],
        [[row["component"], row["attribute"], row["value"], row["status"]] for row in snapshot["materials"]],
    )

    colorways = setup_sheet("Colorways", [18, 28, 28, 34])
    write_table(colorways, ["Colorway", "Role", "Color", "Finish / print"], snapshot["colorways"])

    notes = setup_sheet("Construction Notes", [18, 64, 18, 18])
    all_notes = snapshot["construction_notes"] + snapshot["pattern_notes"]
    write_table(
        notes,
        ["Type", "Note", "Status", "Source"],
        [[row["type"], row["text"], row["status"], row["source"]] for row in all_notes],
    )

    warnings = setup_sheet("Warnings", [14, 26, 34, 64])
    warning_rows = [[row["severity"], row["code"], row.get("field_path", ""), row["message"]] for row in issues]
    write_table(warnings, ["Severity", "Code", "Field path", "Message"], warning_rows)
    for row_index, row in enumerate(warning_rows, start=2):
        for column, value in enumerate(row):
            if value in (None, ""):
                warnings.write_blank(row_index, column, None, warning_format)
            else:
                warnings.write_string(row_index, column, _text(value, ""), warning_format)

    revisions = setup_sheet("Revision Log", [12, 24, 18, 72])
    write_table(
        revisions,
        ["Version", "Created", "Source", "Change summary"],
        [
            [row["version_number"], row["created_at"], row["source"], row["change_summary"]]
            for row in snapshot["revision_history"]
        ],
        {0},
    )

    workbook.close()
    return output.getvalue()
