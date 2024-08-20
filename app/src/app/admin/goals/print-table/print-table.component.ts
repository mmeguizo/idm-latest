import {
    Component,
    Input,
    ElementRef,
    OnInit,
    ViewChild,
    SimpleChanges,
} from '@angular/core';
import { AuthService } from 'src/app/demo/service/auth.service'; // Import AuthService if needed

@Component({
    selector: 'app-print-table',
    templateUrl: './print-table.component.html',
    styleUrls: ['./print-table.component.scss'],
})
export class PrintTableComponent implements OnInit {
    @ViewChild('printTable') printTableElement: ElementRef;
    @Input() objectiveDatas: any[] = [];
    @Input() subOnjectiveHeaderData: string = '';
    @Input() nameValue: string = '';
    @Input() officeValue: string = '';
    @Input() printingOfficeName: string = '';
    @Input() printFlag: boolean = false;
    // @Input() isPrintableVisible: boolean = false;
    imageSrc: string; // To store the image source
    isPrintableVisible: boolean = false;
    constructor(private authService: AuthService) {} // Inject AuthService if needed

    ngOnInit() {
        this.imageSrc =
            this.authService.domain + '/assets/layout/images/logo.png'; // Get the image source
    }

    ngOnChanges(changes: SimpleChanges) {
        console.log(
            {
                printFlag: changes['printFlag']?.previousValue,
                printFlags: changes['printFlag']?.currentValue,
                // objectiveDatas: changes['objectiveDatas'].previousValue,
                // subOnjectiveHeaderData:
                //     changes['subOnjectiveHeaderData'].previousValue,
                // nameValue: changes['nameValue'].previousValue,
                // officeValue: changes['officeValue'].previousValue,
                // printingOfficeName: changes['printingOfficeName'].previousValue,
                // isPrintableVisible: changes['isPrintableVisible'].previousValue,
            },
            this.objectiveDatas
        );
    }

    printTable() {
        this.isPrintableVisible = true;
        setTimeout(() => {
            let print, win;
            const printTableBody =
                document.getElementById('tableBody').innerHTML;
            win = window.open(
                '',
                '_blank',
                'top=0,left=0,height=100%,width=auto'
            );
            win.document.open();
            win.document.write(`
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Document</title>
        </head>
        <style>
          /* Your print-specific CSS styles here (or link an external CSS file) */
        </style>
        <body>
          <div id="tobeprinted">
            <table>
              <thead>
                <tr>
                  <th class="p-0" rowspan="4" colspan="10">
                    <table class="nested-table">
                      <tr>
                        <td rowspan="4" class="logo">
                          <img src="${this.imageSrc}" alt="CHMSU Logo" />
                        </td>
                        <td rowspan="4">
                          <div>
                            <h1>Carlos Hilado Memorial State University</h1>
                            <h5>Alijis Campus . Binalbagan Campus . Fortune Towne Campus . Talisay Campus</h5>
                            <hr />
                          </div>
                        </td>
                        <td>Revision No.</td>
                      </tr>
                      <tr>
                        <td>Date of Revision</td>
                      </tr>
                      <tr>
                        <td>Date of Effectivity</td>
                      </tr>
                      <tr>
                        <td>Page No.</td>
                      </tr>
                    </table>
                  </th>
                  <th>&nbsp;</th>
                </tr>
                <tr>
                  <th>&nbsp;</th>
                </tr>
                <tr>
                  <th>&nbsp;</th>
                </tr>
                <tr>
                  <th class="text-align-end">Page 2</th>
                </tr>
                <tr class="font-condensed">
                  <th colspan="5">${
                      this.subOnjectiveHeaderData.toUpperCase() ||
                      this.printingOfficeName.toUpperCase()
                  }</th>
                  <th colspan="5">QUALITY OBJECTIVES AND ACTION PLAN</th>
                  <th class="text-align-end">CY</th>
                </tr>
                <tr>
                  <th class="border-x-0" colspan="11"></th>
                </tr>
                <tr>
                  <th class="border-x-0" colspan="11"></th>
                </tr>
              </thead>
              <body onload="window.print();window.close()">${printTableBody}</body>
              <tfoot>
                <tr>
                  <td colspan="11">
                    <div>
                      <div>
                        <div>Prepared by:</div>
                        <div>${this.nameValue.toLocaleUpperCase()}</div>
                        <div>${this.officeValue.toLocaleUpperCase()}</div>
                      </div>
                      <div>
                        <div>Reviewed and verified by:</div>
                        <div>YRIKA MARIE R. DUSARAN, PhDTM</div>
                        <div>Director for Quality Management</div>
                      </div>
                      <div>
                        <div>Approved by:</div>
                        <div>ROSALINDA S. TUVILLA</div>
                        <div>Vice President for Administrator and Finance</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </body>
        </html>
    `);
            win.document.close();
            this.isPrintableVisible = false;
        }, 1000);
    }
}
