---
title: "Not All Errors Cost the Same"
description: "Bayesian foundations of evaluation metrics for fraud detection — from F1 to Precision@Recall. Connecting evaluation metrics to business cost, error asymmetry, and threshold choice."
date: 2026-03-15
category: machine-learning
reading_time: "12 min"
---

> Work in progress. Full article coming soon.

A technical case interview revealed I had been using F1 on autopilot — without consciously connecting it to business cost, error asymmetry, or threshold choice. This article is the study I should have done before that interview.

## What This Is About

Precision and Recall are conditional probabilities. Their relationship is governed by Bayes' theorem. Class imbalance is the base rate problem in disguise. F1 treats all errors as equally costly; Precision@Recall does not. In fraud detection, the difference matters.

## Topics Covered

- Confusion matrix as a probability space — Precision as a posterior, Recall as a likelihood.
- Bayes' theorem connecting Precision, Recall, and base rate.
- Cost-sensitive decision theory: optimal threshold derivation under asymmetric costs.
- F1 and the F-beta family — what "equal weight" actually means.
- ROC curve vs Precision-Recall curve — what each reveals and what each hides.
- Precision@Recall — definition, business interpretation, and why it beats F1 for fraud detection.
- Five reproducible experiments connecting theory to evidence.

## Source

The full article source and reproducible experiments are available on [GitHub](https://github.com/brunoramosmartins/precision-recall-fraud).
