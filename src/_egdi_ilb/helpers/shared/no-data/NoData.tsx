import { Lottie } from "lottie-react";
import noResultAnimation from "../../../../_egdi_ilb/assets/images/no_result_found.json";

type NoDataProps = {
    title?: string;
    subTitle?: string;
    bigTitle?: boolean;
};

export default function NoData({
    title,
    subTitle,
    bigTitle = false,
}: NoDataProps) {
    return (
        <div className="page-information">
            <div style={{ width: 120, height: 120, marginBottom: 6 }} className="mx-auto">
                <Lottie
                    src={noResultAnimation}
                    loop
                    style={{ width: "100%", height: "100%" }}
                />
            </div>
            <p style={{ fontSize: 12, textAlign: "center" }} className={bigTitle ? "big-title" : undefined}>
                {title ?? "Empty Data!"}
            </p>
            {subTitle && <p style={{ fontSize: 11 }} className="text-center">
                {subTitle}
            </p>}
        </div>
    );
}