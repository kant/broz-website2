import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { API_URL } from '../../env';
import { QuotesAddQuoteDialogComponent } from '../quotes-add-quote-dialog/quotes-add-quote-dialog.component';
import { QuotesEditQuoteDialogComponent } from '../quotes-edit-quote-dialog/quotes-edit-quote-dialog.component';
import { QuotesDeleteQuoteDialogComponent } from '../quotes-delete-quote-dialog/quotes-delete-quote-dialog.component';

export interface Quote {
  id: number,
  name: string,
  quote: string,
  date: Date,
}

export interface QuoteData {
  name: string,
  quote: string,
  date: string,
}

@Component({
  selector: 'app-quotes',
  templateUrl: './quotes.component.html',
  styleUrls: ['./quotes.component.css']
})

export class QuotesComponent implements OnInit {
  fullQuotes;
  dataSourceQuotes = new MatTableDataSource<Quote>();
  maxall: number = 20;

  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[] = ['id', 'name', 'quote', 'date', 'editActions'];

  constructor(public dialog: MatDialog, private http: HttpClient) {
  }

  ngOnInit(): void {
    this.getAllQuotesAPI().subscribe(val => {
      this.refreshTable(val);
      this.dataSourceQuotes.sort = this.sort;
      this.dataSourceQuotes.paginator = this.paginator;
      console.log('quotes: AllQuotes');
      console.log(val);
    })
  }

  addQuote() {
    const addDialogRef = this.dialog.open(QuotesAddQuoteDialogComponent, {
      width: '500px',
    });
    addDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.postQuoteAPI(result);
        console.log('quotes: add quote');
        console.log(result);
      }
    });
  }

  editQuote(element) {
    const editDialogRef = this.dialog.open(QuotesEditQuoteDialogComponent, {
      width: '500px',
      data: { id: element.id, name: element.name, quote: element.quote, date: element.date }
    });
    editDialogRef.afterClosed().subscribe(result => {
      if (result) {
        // TODO Send edited quote and refresh table
      }
    });
  }

  deleteQuote(element) {
    const deleteDialogRef = this.dialog.open(QuotesDeleteQuoteDialogComponent, {
      width: '300px',
      data: { id: element.id, name: element.name, quote: element.quote, date: element.date }
    });
    deleteDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteQuoteAPI(result);
        console.log('quotes: delete quote');
        console.log(result);
      }
    });
  }

  getAllQuotesAPI() {
    return this.http.get(`${API_URL}/quotes`)
  }

  postQuoteAPI(quote: QuoteData) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = quote;
    this.http.post(`${API_URL}/quotes`, body, { headers }).subscribe(
      (val) => {
        console.log('POST call successful value returned in body', val);
        this.refreshTable(val);
      },
      response => {
        console.log('POST call in error', response);
      },
      () => {
        console.log('The POST observable is now completed.');
      }
    );
  }

  deleteQuoteAPI(quote: Quote) {
    this.http.delete(`${API_URL}/quotes/${quote.id - 1}`).subscribe(
      (val) => {
        console.log('DELETE call successful value returned in body', val);
        this.refreshTable(val);
      },
      response => {
        console.log('DELETE call in error', response);
      },
      () => {
        console.log('The DELETE observable is now completed.');
      }
    );
  }

  refreshTable(val: any) {
    this.fullQuotes = val;
    this.dataSourceQuotes.data = this.fullQuotes.quotes_list;
    for (let ii = 0; ii < this.dataSourceQuotes.data.length; ii++) {
      this.dataSourceQuotes.data[ii].id = ii + 1;
    }
  }
}
