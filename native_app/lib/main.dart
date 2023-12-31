import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'dart:async';

import 'package:health/health.dart';

const List<HealthDataType> dataTypes = [
  HealthDataType.STEPS,
  HealthDataType.DISTANCE_WALKING_RUNNING,
  HealthDataType.ACTIVE_ENERGY_BURNED,
  // iOS非対応
  // HealthDataType.MOVE_MINUTES,
  HealthDataType.BASAL_ENERGY_BURNED,
  HealthDataType.SLEEP_IN_BED,
  HealthDataType.SLEEP_REM,
  HealthDataType.WORKOUT
];

Future main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (!kIsWeb &&
      kDebugMode &&
      defaultTargetPlatform == TargetPlatform.android) {
    await InAppWebViewController.setWebContentsDebuggingEnabled(kDebugMode);
  }
  runApp(const MaterialApp(home: MyApp()));
}

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final GlobalKey webViewKey = GlobalKey();

  InAppWebViewController? webViewController;

  List<HealthDataPoint> healthData = [];

  HealthFactory health = HealthFactory(useHealthConnectIfAvailable: true);

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
        onWillPop: () async {
          // detect Android back button click
          final controller = webViewController;
          if (controller != null) {
            if (await controller.canGoBack()) {
              controller.goBack();
              return false;
            }
          }
          return true;
        },
        child: Scaffold(
            appBar: AppBar(
              title: const Text("InAppWebView test"),
              actions: [
                IconButton(
                  icon: Icon(Icons.sync), // アイコンを指定
                  onPressed: () async {
                    // ボタンが押されたときの処理をここに書きます
                    print('ボタンが押されました！');

                    await onSync();
                  },
                ),
              ],
            ),
            // body: Column(children: <Widget>[
            //   Expanded(
            //     child: InAppWebView(
            //       key: webViewKey,
            //       initialUrlRequest:
            //           URLRequest(url: WebUri("https://github.com/flutter")),
            //       initialSettings: InAppWebViewSettings(
            //           allowsBackForwardNavigationGestures: true),
            //       onWebViewCreated: (controller) {
            //         webViewController = controller;
            //       },
            //     ),
            //   ),
            // ])),
            body: Column(children: [
              Expanded(
                  child: ListView(
                      padding: const EdgeInsets.all(8),
                      children: dataTypes.map((dataType) {
                        var filtered =
                            healthData.where((point) => point.type == dataType);
                        return Text(
                            "${dataType.name}のデータは${filtered.length}個あります");
                      }).toList())),
              Expanded(
                  child: ListView(
                      padding: const EdgeInsets.all(8),
                      children: healthData.map((point) {
                        return Text(
                            "${point.type}/${point.value.toString()} ${point.dateFrom.day}日 ${point.dateFrom.hour}:${point.dateFrom.minute} ~ ${point.dateTo.hour}:${point.dateTo.minute}");
                      }).toList()))
            ])));
  }

  Future onSync() async {
    final permissions = dataTypes.map((e) => HealthDataAccess.READ).toList();

    // Check if we have permission
    bool? hasPermissions =
        await health.hasPermissions(dataTypes, permissions: permissions);

    hasPermissions ??= false;
    if (hasPermissions) {
      await fetchData();
      return;
    }
    bool authorized = false;

    // requesting access to the data types before reading them
    try {
      authorized = await health.requestAuthorization(dataTypes,
          permissions: permissions);
    } catch (error) {
      print("Exception in authorize: $error");
    }

    if (!authorized) {
      await showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text('エラー'),
            content: Text('権限がないため同期できませんでした。'),
            actions: [
              // ダイアログのボタンを追加
              TextButton(
                onPressed: () {
                  // ボタンが押されたらダイアログを閉じる
                  Navigator.of(context).pop();
                },
                child: Text('閉じる'),
              ),
            ],
          );
        },
      );
      return;
    }

    await fetchData();
  }

  fetchData() async {
    // get data within the last 24 hours
    final now = DateTime.now();
    final yesterday = now.subtract(Duration(days: 4 * 7));
    healthData.clear();

    // fetch health data
    List<HealthDataPoint> _healthData = HealthFactory.removeDuplicates(
        await health.getHealthDataFromTypes(yesterday, now, dataTypes));

    print("count is ${_healthData.length}");

    setState(() {
      healthData = HealthFactory.removeDuplicates(_healthData);
    });

    await sendPoints(healthData);
  }

  Future<http.Response> sendPoints(List<HealthDataPoint> points) {
    final postBody = points
        .map((e) => {
              "value": double.parse(e.value.toString()),
              "dateFrom": e.dateFrom.toUtc().toIso8601String(),
              "dateTo": e.dateTo.toUtc().toIso8601String(),
              "type": e.type.name
            })
        .toList();
    return http
        .post(
      Uri.parse('http://192.168.10.102:3000/health/points'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
        "Authorization":
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTc0N2ZlZS1hYWI2LTQ1ODktODc4ZC01N2JlMjZlMmI1ZDEiLCJpYXQiOjE2OTA2ODU2NDZ9.wkuvOFCpA92MqcHjsGhSt9Fk45hcejGYahkaun_mlMQ"
      },
      // body: jsonEncode(points.map((point) {
      //   return {
      //     "value": point.value.toString(),
      //     "dateFrom": point.dateFrom,
      //     "dateTo": point.dateTo,
      //     "type": point.type
      //   };
      // })),
      body: jsonEncode(postBody),
    )
        .then((value) {
      print(value.statusCode);
      if (value.body.isNotEmpty) {
        print(jsonDecode(value.body));
      } else {
        print("NO_RESPONSE_BODY");
      }
      return value;
    });
  }
}
