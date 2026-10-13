import PDFKit
import AppKit
let args = CommandLine.arguments
guard args.count >= 3, let doc = PDFDocument(url: URL(fileURLWithPath: args[1])) else { print("usage: pdfrender <pdf> <outdir> [scale]"); exit(1) }
let out = args[2]
let scale = args.count > 3 ? CGFloat(Double(args[3]) ?? 1.5) : 1.5
for i in 0..<doc.pageCount {
    guard let page = doc.page(at: i) else { continue }
    let box = page.bounds(for: .mediaBox)
    let size = NSSize(width: box.width * scale, height: box.height * scale)
    let img = page.thumbnail(of: size, for: .mediaBox)
    if let tiff = img.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff), let png = rep.representation(using: .png, properties: [:]) {
        try? png.write(to: URL(fileURLWithPath: "\(out)/page-\(i+1).png"))
        print("page \(i+1): \(Int(size.width))x\(Int(size.height))")
    }
}
